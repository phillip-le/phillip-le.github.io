import { JobNotFoundError, applyForJob } from './applyForJob';
import {
  createJobApplication,
  getJob,
  logger,
  sendJobApplicationSuccessNotification,
} from './services';
import type { JobApplication } from './types';

vi.mock('./services');

describe('applyForJob - simple', () => {
  const applyForJobPayload: Parameters<typeof applyForJob>[0] = {
    userId: 'user-id',
    jobId: 'job-id',
  };

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should throw a JobNotFoundError when job is not found', async () => {
    vi.mocked(getJob).mockResolvedValueOnce(null);

    await expect(applyForJob(applyForJobPayload)).rejects.toThrowError(
      JobNotFoundError,
    );
  });

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

  it('should return job application when everything is successful', async () => {
    const jobApplication: JobApplication = {
      jobApplicationId: 'job-application-id',
      jobId: applyForJobPayload.jobId,
      userId: applyForJobPayload.userId,
    };

    vi.mocked(getJob).mockResolvedValueOnce({
      jobId: applyForJobPayload.jobId,
    });
    vi.mocked(createJobApplication).mockResolvedValueOnce(jobApplication);
    vi.mocked(sendJobApplicationSuccessNotification).mockResolvedValueOnce();

    const result = await applyForJob(applyForJobPayload);

    expect(result).toEqual<JobApplication>(jobApplication);

    expect(getJob).toHaveBeenCalledWith<Parameters<typeof getJob>>(
      applyForJobPayload.jobId,
    );
    expect(createJobApplication).toHaveBeenCalledWith<
      Parameters<typeof createJobApplication>
    >({
      jobId: applyForJobPayload.jobId,
      userId: applyForJobPayload.userId,
    });
    expect(sendJobApplicationSuccessNotification).toHaveBeenCalledWith<
      Parameters<typeof sendJobApplicationSuccessNotification>
    >(jobApplication);
  });
});

describe('applyForJob - nested and DRY', () => {
  const applyForJobPayload: Parameters<typeof applyForJob>[0] = {
    userId: 'user-id',
    jobId: 'job-id',
  };

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should throw a JobNotFoundError when job is not found', async () => {
    vi.mocked(getJob).mockResolvedValueOnce(null);

    await expect(applyForJob(applyForJobPayload)).rejects.toThrowError(
      JobNotFoundError,
    );
  });

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

      expect(logger.error).toHaveBeenCalledWith({
        error: 'unexpected error',
        jobId: 'job-id',
        userId: 'user-id',
      });
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

        expect(logger.error).toHaveBeenCalledWith({
          error: 'notification publish failed',
          jobId: 'job-id',
          userId: 'user-id',
        });
      });

      it('should return job application when everything is successful', async () => {
        vi.mocked(
          sendJobApplicationSuccessNotification,
        ).mockResolvedValueOnce();

        const result = await applyForJob(applyForJobPayload);

        expect(result).toEqual<JobApplication>(jobApplication);

        expect(getJob).toHaveBeenCalledWith<Parameters<typeof getJob>>(
          applyForJobPayload.jobId,
        );
        expect(createJobApplication).toHaveBeenCalledWith<
          Parameters<typeof createJobApplication>
        >({
          jobId: applyForJobPayload.jobId,
          userId: applyForJobPayload.userId,
        });
        expect(sendJobApplicationSuccessNotification).toHaveBeenCalledWith<
          Parameters<typeof sendJobApplicationSuccessNotification>
        >(jobApplication);
      });
    });
  });
});

describe('applyForJob - only modifying what we need to make the test pass', () => {
  const applyForJobPayload: Parameters<typeof applyForJob>[0] = {
    userId: 'user-id',
    jobId: 'job-id',
  };

  const jobApplication: JobApplication = {
    jobApplicationId: 'job-application-id',
    jobId: applyForJobPayload.jobId,
    userId: applyForJobPayload.userId,
  };

  beforeEach(() => {
    vi.mocked(getJob).mockResolvedValueOnce({
      jobId: applyForJobPayload.jobId,
    });
    vi.mocked(createJobApplication).mockResolvedValueOnce(jobApplication);
    vi.mocked(sendJobApplicationSuccessNotification).mockResolvedValueOnce();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should throw a JobNotFoundError when job is not found', async () => {
    vi.mocked(getJob).mockReset().mockResolvedValueOnce(null);

    await expect(applyForJob(applyForJobPayload)).rejects.toThrowError(
      JobNotFoundError,
    );
  });

  it('should throw an error and log when creating a job application fails', async () => {
    vi.mocked(createJobApplication)
      .mockReset()
      .mockRejectedValueOnce('unexpected error');

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
    vi.mocked(sendJobApplicationSuccessNotification)
      .mockReset()
      .mockRejectedValueOnce('notification publish failed');

    await expect(applyForJob(applyForJobPayload)).rejects.toThrowError(
      'Failed to apply to job',
    );

    expect(logger.error).toHaveBeenCalledWith({
      error: 'notification publish failed',
      jobId: 'job-id',
      userId: 'user-id',
    });
  });

  it('should return job application when everything is successful', async () => {
    const jobApplication: JobApplication = {
      jobApplicationId: 'job-application-id',
      jobId: applyForJobPayload.jobId,
      userId: applyForJobPayload.userId,
    };

    vi.mocked(getJob).mockReset().mockResolvedValueOnce({
      jobId: applyForJobPayload.jobId,
    });
    vi.mocked(createJobApplication)
      .mockReset()
      .mockResolvedValueOnce(jobApplication);
    vi.mocked(sendJobApplicationSuccessNotification)
      .mockReset()
      .mockResolvedValueOnce();

    const result = await applyForJob(applyForJobPayload);

    expect(result).toEqual<JobApplication>(jobApplication);

    expect(getJob).toHaveBeenCalledWith<Parameters<typeof getJob>>(
      applyForJobPayload.jobId,
    );
    expect(createJobApplication).toHaveBeenCalledWith<
      Parameters<typeof createJobApplication>
    >({
      jobId: applyForJobPayload.jobId,
      userId: applyForJobPayload.userId,
    });
    expect(sendJobApplicationSuccessNotification).toHaveBeenCalledWith<
      Parameters<typeof sendJobApplicationSuccessNotification>
    >(jobApplication);
  });
});
