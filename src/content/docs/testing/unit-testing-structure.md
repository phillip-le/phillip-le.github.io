---
title: 'Unit testing structure'
lastUpdated: 2024-07-14
---

One of the challenges of writing good unit test suites is making it clear what makes a test pass/fail.

For example, take a look at the following function:

```ts
export const applyForJob = async ({
  userId,
  jobId,
}: {
  userId: string;
  jobId: string;
}) => {
  try {
    const job = await getJob(jobId);
    if (!job) {
      throw new JobNotFoundError();
    }

    const jobApplication = await createJobApplication({ userId, jobId });

    await sendJobApplicationSuccessNotification(jobApplication);

    return jobApplication;
  } catch (error: unknown) {
    if (error instanceof JobNotFoundError) {
      throw error;
    }
    logger.error({
      userId,
      jobId,
      error,
    });
    throw new Error('Failed to apply to job', {
      cause: error,
    });
  }
};
```

There are a few things that we need to test in this function:

1. The happy path, where we get a job application when everything is successful and we call our underlying functions correctly.
2. We throw a `JobNotFoundError` when `getJob` returns `null`.
3. We throw an error and log whenever `createJobApplication` or `sendJobApplicationSuccessNotification` throws an error.

### Simple approach

The simplest approach to writing a test suite for `applyForJob` would be to set up the appropriate mocks in every test case.

For example, when we check that we are throwing a `JobNotFoundError`, we only need to mock the response of `getJob`:

```ts
it('should throw a JobNotFoundError when job is not found', async () => {
  vi.mocked(getJob).mockResolvedValueOnce(null);

  await expect(applyForJob(applyForJobPayload)).rejects.toThrowError(
    JobNotFoundError,
  );
});
```

When we are checking that we are throwing an error and logging whenever `createJobApplication` or `sendJobApplicationSuccessNotification` throws an error, we would set up `getJob` again for both:

```ts {2-4,19-21}
it('should throw an error and log when creating a job application fails', async () => {
  vi.mocked(getJob).mockResolvedValueOnce({
    jobId: applyForJobPayload.jobId,
  });
  vi.mocked(createJobApplication).mockRejectedValueOnce('unexpected error');

  await expect(applyForJob(applyForJobPayload)).rejects.toThrowError(
    'Failed to apply to job',
  );

  expect(logger.error).toHaveBeenCalledWith({
    error: 'unexpected error',
    jobId: 'job-id',
    userId: 'user-id',
  });
});

it('should throw an error and log when sending a job application success notification fails', async () => {
  vi.mocked(getJob).mockResolvedValueOnce({
    jobId: applyForJobPayload.jobId,
  });
  vi.mocked(createJobApplication).mockResolvedValueOnce({
    jobApplicationId: 'job-application-id',
    jobId: applyForJobPayload.jobId,
    userId: applyForJobPayload.userId,
  });
  vi.mocked(sendJobApplicationSuccessNotification).mockRejectedValueOnce(
    'notification publish failed',
  );

  await expect(applyForJob(applyForJobPayload)).rejects.toThrowError(
    'Failed to apply to job',
  );

  expect(logger.error).toHaveBeenCalledWith({
    error: 'notification publish failed',
    jobId: 'job-id',
    userId: 'user-id',
  });
});
```

The benefit of this approach is that everything a reader needs to know about why a test case passes or fails is self-contained within each test case.

Some of the disadvantages of this approach are:

- When there are many mocks set up, it is not clear what exactly is different about this particular test case.
- There is some code duplication.

### Nesting `describe` blocks to be DRY

One of the approaches that I dislike when it comes to attempting to solve the previous issues is through nested `describe` blocks. This path of development usually comes when someone realizes that there is a lot of code duplication in the mock setups and refactors the test suite to be more [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

```ts {2-6,23-25}
describe('job is found', () => {
  beforeEach(() => {
    vi.mocked(getJob).mockResolvedValueOnce({
      jobId: applyForJobPayload.jobId,
    });
  });

  it('should throw an error and log when creating a job application fails', async () => {
    vi.mocked(createJobApplication).mockRejectedValueOnce('unexpected error');

    await expect(applyForJob(applyForJobPayload)).rejects.toThrowError(
      'Failed to apply to job',
    );
  });

  describe('creating job application is successful', () => {
    const jobApplication: JobApplication = {
      jobApplicationId: 'job-application-id',
      jobId: applyForJobPayload.jobId,
      userId: applyForJobPayload.userId,
    };

    beforeEach(() => {
      vi.mocked(createJobApplication).mockResolvedValueOnce(jobApplication);
    });

    it('should throw an error and log when sending a job application success notification fails', async () => {
      vi.mocked(sendJobApplicationSuccessNotification).mockRejectedValueOnce(
        'notification publish failed',
      );

      await expect(applyForJob(applyForJobPayload)).rejects.toThrowError(
        'Failed to apply to job',
      );
    });
  });
});
```

Now, instead of repeating our mock setups in every test case, by using `describe` blocks, we can create bounded test contexts which set up mocks in `beforeEach` statements. So, every test that needs `getJob` to return a job will be within this `describe` block:

```ts
describe('job is found', () => {
  beforeEach(() => {
    vi.mocked(getJob).mockResolvedValueOnce({
      jobId: applyForJobPayload.jobId,
    });
  });

  // ...
});
```

I do not recommend this approach because when a reader wants to understand everything that a test needs to pass or fail, they will need to look at every single `describe` block that the test is nested within. This means that the needed context is scattered across the file. It is especially difficult to figure out which `describe` blocks apply when the test suite is long and complex.

I would actually prefer the previous, more verbose approach given that it is easier for a maintainer to understand the test suite when they are unfamiliar with the codebase. 

### Only modifying what we need to make the test pass

An approach that I prefer is to set up all the mocks according to the happy path within a single `beforeEach` statement:

```ts
beforeEach(() => {
  vi.mocked(getJob).mockResolvedValueOnce({
    jobId: applyForJobPayload.jobId,
  });
  vi.mocked(createJobApplication).mockResolvedValueOnce(jobApplication);
  vi.mocked(sendJobApplicationSuccessNotification).mockResolvedValueOnce();
});
```

For each test, we use the `mockReset` method to only modify the mock that we need for the test to pass.

```ts
it('should throw a JobNotFoundError when job is not found', async () => {
  vi.mocked(getJob).mockReset().mockResolvedValueOnce(null);

  await expect(applyForJob(applyForJobPayload)).rejects.toThrowError(
    JobNotFoundError,
  );
});
```

This approach means that when a reader looks at a test case, they only need to see **what has changed from the happy path** to make this test case pass. When they are debugging an issue with their tests, they only need to refer to two locations: the test case they are writing and the single `beforeEach` statement in the test suite, which means that context is not scattered all over the file.