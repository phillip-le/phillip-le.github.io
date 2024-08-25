---
title: 'Testing network requests'
lastUpdated: 2024-07-21
---

:::caution
This article is still a draft, incomplete and highly subject to change.
:::

There are a number of different ways to approach unit testing functions
that make API requests. In this article, I will assume that we are making API
requests to a REST API. I will discuss how we can test our API requests using:

1. Native `vitest` / `jest` mocking
1. [nock](https://github.com/nock/nock)
1. [msw](https://github.com/mswjs/msw)

## Functions that will be tested

Usually there are usually three kinds of requests that we can make.

1. Retrieving data from a server
1. Sending data to a server and handling errors if the server returns an error
1. Sending data to a server and handling errors if we do not care what the server returns

For the purposes of this article, I will be using the following API requests to demonstrate
how we can test network requests. They each involve retrieving, creating or tracking profile
data with the [axios](https://github.com/axios/axios) HTTP client. A profile will look like this:

```ts
export type Profile = {
  profileId: string;
  name: string;
};
```

### Get profile

The first function retrieves a profile by sending a `GET /profiles/${profileId}` request with a
bearer token.

```ts
import request from 'axios';

const profileDataSource = {
  getProfile: async ({ bearerToken, profileId }) => {
    const response = await request<Profile>({
      url: `/profiles/${profileId}`,
      baseURL: baseUrl,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });

    return response.data;
  },
};
```

### Create a profile

Similarly, this function creates a profile by sending a `POST /profiles` with a
payload and bearer token.

```ts
const profileDataSource = {
  createProfile: async ({ bearerToken, name }) => {
    const response = await request<Profile>({
      url: '/profiles',
      baseURL: baseUrl,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      data: {
        name,
      },
    });

    return response.data;
  },
};
```

### Send profile created event

This function is very similar to `createProfile` except the `validateStatus` function
is used to ensure that we ignore the response from the server. This means that
`sendProfileCreatedTrackingEvent` does not care if there is a network error or if the
server returns an invalid response status code.

This is quite common for either sending events for analytics or logging where we do not
want to throw an error for non-critical use cases.

```ts "validateStatus: () => true"
const profileDataSource = {
  sendProfileCreatedTrackingEvent: async (profileId) => {
    await request({
      url: '/analytics/profile-created-event',
      baseURL: baseUrl,
      method: 'POST',
      data: {
        profileId,
      },
      validateStatus: () => true,
    });
  },
};
```

## Native `vitest` / `jest` mocking

The first thought we might have is to use the native mocking functionality that is provided by our testing framework.
I will be using `vitest` for the examples in this article, but `jest` will be very similar.

### Setup

To setup our test, we need to mock out the `request` function from our HTTP client, in this case, `axios`.

```ts
vi.mock('axios');
```

This replaces the implementation of `request` with a mock stub, `vi.fn()`.

Since we will be setting the return value of `request` in each test, we should make
sure that each test is cleaned up appropriately so that the tests are run in isolation.

```ts
afterEach(() => {
  vi.resetAllMocks();
});
```

### Mocking when retrieving data

To test our `getProfile` function we could mock out what `request` returns:

```ts {2}
it('should return profile when calling getProfile', async () => {
  vi.mocked(request).mockResolvedValueOnce({ data: profile });

  const result = await profileDataSource.getProfile({
    bearerToken,
    profileId: profile.profileId,
  });

  expect(result).toEqual(profile);
});
```

Then, we could assert that `request` was called with the correct parameters:

```ts
expect(request).toHaveBeenCalledWith<[AxiosRequestConfig]>(
  expect.objectContaining<AxiosRequestConfig>({
    url: `/profiles/${profile.profileId}`,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  }),
);
```

### Mocking when sending data with response handled

Similarly, to test our `createProfile` function we could mock out what `request` returns and assert that `request` is called with the correct parameters:

```ts
it('should create a profile when calling createProfile', async () => {
  vi.mocked(request).mockResolvedValueOnce({ data: profile });

  const result = await profileDataSource.createProfile({
    bearerToken,
    name: profile.name,
  });

  expect(result).toEqual(profile);
  expect(request).toHaveBeenCalledWith<[AxiosRequestConfig]>(
    expect.objectContaining<AxiosRequestConfig>({
      url: '/profiles',
      data: {
        name: profile.name,
      },
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    }),
  );
});
```

### Mocking when sending with response unhandled

Similarly, to test our `sendProfileCreatedTrackingEvent` function we could mock out what `request` returns and assert that `request` is called with the correct parameters:

```ts
it('should send tracking event with profileId when calling sendProfileCreatedTrackingEvent', async () => {
  vi.mocked(request).mockResolvedValueOnce({});

  await profileDataSource.sendProfileCreatedTrackingEvent(profile.profileId);

  expect(request).toHaveBeenCalledWith<[AxiosRequestConfig]>(
    expect.objectContaining<AxiosRequestConfig>({
      url: '/analytics/profile-created-event',
      data: {
        profileId: profile.profileId,
      },
    }),
  );
});
```

As mentioned before, `vi.mock` will replace the implementation of `request` with a mock stub `vi.fn()` and so we do not actually need to mock out the return value of `request` because `sendProfileCreatedTrackingEvent` never uses the return value of `request`.

```diff lang="ts"
it('should send tracking event with profileId when calling sendProfileCreatedTrackingEvent', async () => {
-  vi.mocked(request).mockResolvedValueOnce({})
  await profileDataSource.sendProfileCreatedTrackingEvent(profile.profileId);
  //...
})
```

### Error handling

The main problem with mocking out `request` is that it is usually very challenging to correctly mirror the behavior of your HTTP client when it receives an error.

For example, `axios` will throw an error when it receives a non-2xx HTTP status code whereas `fetch` will not.

So, if I added a check to `getProfile` so that it returned `null` if the response status code was `404`.

```diff lang="ts"
const getProfile = async ({ bearerToken, profileId }) => {
  const response = await request<Profile>({
    url: `/profiles/${profileId}`,
    baseURL: baseUrl,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

+  if (response.status === 404) {
+    return null;
+  }

  return response.data;
}
```

You may think that the following test case covers the scenario where the server returns `404`:

```ts
it('should return null when server returns 404 on getProfile', async () => {
  vi.mocked(request).mockResolvedValueOnce({ status: 404 });

  const result = await profileDataSource.getProfile({
    bearerToken,
    profileId: profile.profileId,
  });

  expect(result).toEqual(null);
});
```

The test case even passes!

However, when you run `getProfile` against a live API that returns `404` you will discover that `getProfile` throws an error instead of returning `null`. This is because, as mentioned before, `axios` throws an error by default when receiving a non-2xx status code like `404`.

You would need to explicitly define a `validateStatus` function in the `request` parameters which tells `axios` that `404` is an expected status code.

```diff lang="ts"
const response = await request<Profile>({
  url: `/profiles/${profileId}`,
  baseURL: baseUrl,
  method: 'GET',
  headers: {
    Authorization: `Bearer ${bearerToken}`,
  },
+  validateStatus: (status) => status >= 200 || status < 300 || status === 404,
});
```

Another very common mistake when dealing with HTTP clients is that we log the error from the HTTP client directly:

```ts
try {
  await getProfile({ profileId, bearerToken });
} catch (error) {
  console.error(error);
  throw error;
}
```

We would test what happens when `request` throws an error like this:

```ts {3}
it('should throw error when server returns 500', async () => {
  expect.hasAssertions();
  vi.mocked(request).mockRejectedValueOnce(new Error('Internal Server Error'));

  try {
    await profileDataSource.createProfile({
      name: profile.name,
      bearerToken,
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    expect(axiosError).toMatchInlineSnapshot('[Error: Internal Server Error]');
  }
});
```

The key line is:

```ts "new Error('Internal Server Error')"
vi.mocked(request).mockRejectedValueOnce(new Error('Internal Server Error'));
```

`axios` does not actually throw simple errors like `new Error('Internal Server Error')`. It actually throws an `AxiosError` that contains sensitive information like your authorization headers:

```ts {5}
expect(axiosError.config?.headers).toMatchInlineSnapshot(`
  {
    "Accept": "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, compress, deflate, br",
    "Authorization": "Bearer some-bearer-token",
    "Content-Length": "17",
    "Content-Type": "application/json",
    "User-Agent": "axios/1.7.3",
  }
`);
```

This is hard to discover because usually we do not sanity check what happens with error scenarios when developing.

The following sections look at libraries that help with providing more accurate mocks.

## nock

[nock](https://github.com/nock/nock) is a "HTTP server mocking and expectations library for Node.js". `nock` works by intercepting requests that match the HTTP server mocks.

### Setup

By default, `nock` will allow any HTTP requests that do not match the HTTP server mocks to be executed as a real HTTP request. This is usually not ideal, so it can be good to simply [disable all real HTTP requests](https://github.com/nock/nock?tab=readme-ov-file#enabledisable-real-http-requests) and restore them after running the tests.

```ts
beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});
```

We can also add `nock.cleanAll()` to clean up all HTTP mocks that we have setup in each test so that our tests are run in isolation.

```ts
afterEach(() => {
  nock.cleanAll();
});
```

### Mocking when retrieving data

Firstly, we need to setup the `baseUrl` for where our requests are going:

```ts
import nock from 'nock';

nock(baseUrl);
```

Then, we can match the path and method of the request:

```ts
nock(baseUrl).get(`/profiles/${profile.profileId}`);
```

Then, we can specify what the server should return. In this case, we will return a `200` status code and a profile object.

```ts
nock(baseUrl).get(`/profiles/${profile.profileId}`).reply(200, profile);
```

We can also verify that requests are sent with the correct authorization headers:

```ts {2}
nock(baseUrl)
  .matchHeader('authorization', `Bearer ${bearerToken}`)
  .get(`/profiles/${profile.profileId}`)
  .reply(200, profile);
```

So, our test case would look like:

```diff lang="ts"
import nock from 'nock';

it('should return profile when calling getProfile', async () => {
  const scope = nock(baseUrl)
    .matchHeader('authorization', `Bearer ${bearerToken}`)
    .get(`/profiles/${profile.profileId}`)
    .reply(200, profile);

  const result = await profileDataSource.getProfile({
    bearerToken,
    profileId: profile.profileId,
  });

  expect(result).toEqual(profile);

+  scope.isDone();
});
```

I have added `scope.isDone()` at the end of the test which verifies that all `nock` mocks in the test have been used.

### Mocking when sending data with response handled

Similarly, we can use `nock` for `POST` requests:

```ts
it('should create a profile when calling createProfile', async () => {
  const scope = nock(baseUrl)
    .matchHeader('authorization', `Bearer ${bearerToken}`)
    .post('/profiles', {
      name: profile.name,
    })
    .reply(200, profile);

  const result = await profileDataSource.createProfile({
    bearerToken,
    name: profile.name,
  });

  expect(result).toEqual(profile);

  scope.isDone();
});
```

### Mocking when sending with response unhandled

There is basically no difference with this case compared to when the response is handled.

### Error handling

Error handling is where it gets interesting. Since we are not mocking out `axios`, `request` will throw real `AxiosError`s.

In the case where we should return `null` when the server returns a `404`, we could have the following test:

```ts
it('should return null when server returns 404 on getProfile', async () => {
  const scope = nock(baseUrl)
    .matchHeader('authorization', `Bearer ${bearerToken}`)
    .get(`/profiles/${profile.profileId}`)
    .reply(404);

  const result = await profileDataSource.getProfile({
    bearerToken,
    profileId: profile.profileId,
  });

  expect(result).toEqual(null);

  scope.isDone();
});
```

When we run this test without the appropriate `validateStatus` function:

```diff lang="ts"
const response = await request<Profile>({
  url: `/profiles/${profileId}`,
  baseURL: baseUrl,
  method: 'GET',
  headers: {
    Authorization: `Bearer ${bearerToken}`,
  },
-  validateStatus: (status) => status >= 200 || status < 300 || status === 404,
});
```

We receive the following error:

```sh
AxiosError: Request failed with status code 404
```

This is great! This means that our tests have meaningfully shown us that our implementation is incorrect because it does not behave the way we expect.

Similarly, when we receive an unexpected error like the server returning a `500`, we can see that the error contains sensitive authorization header information which we should not be logged.

```ts {16}
it('should throw error when server returns 500', async () => {
  expect.hasAssertions();
  const scope = nock(baseUrl).post('/profiles').reply(500);

  try {
    await profileDataSource.createProfile({
      name: profile.name,
      bearerToken,
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    expect(axiosError.config?.headers).toMatchInlineSnapshot(`
      {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, compress, deflate, br",
        "Authorization": "Bearer some-bearer-token",
        "Content-Length": "17",
        "Content-Type": "application/json",
        "User-Agent": "axios/1.7.3",
      }
    `);
  }

  scope.isDone();
});
```

For this test case, [expect.hasAssertions](https://vitest.dev/api/expect.html#expect-hasassertions) is used to ensure that at least one `expect` assertion is run. In the case where `createProfile` resolves without throwing an error, the `expect(axiosError.config?.headers).toMatchInlineSnapshot` assertion would not run and so `expect.hasAssertions` would cause the test to fail.

### Browser support

I have had poor experiences with getting `nock` to work with browser environments and support for mocking with `nock` varies wildly between different HTTP clients. Personally, I have not tried to use `nock` with the native browser `fetch` API and so the following advice is for usage with `axios`.

Usually, in a frontend repository, the default test environment for tests will be [jsdom](https://www.npmjs.com/package/jsdom). A hacky workaround for getting `nock` to work with specific test files which do not need browser specific APIs is to override the test environment for that particular test file to use `node`.

According to the [vitest documentation](https://vitest.dev/guide/environment.html#test-environment), you can add the following to the top of your test file:

```ts
// @vitest-environment node
```

According to the [jest documentation](https://jestjs.io/docs/configuration#testenvironment-string), you can add the following to the top of your test file:

```ts
/**
 * @jest-environment node
 */
```

However, for use cases where you do need browser specific APIs, you can add the following override the default `axios` config at the top of your test file:

```ts
axios.defaults.adapter = 'http';
```

See [this section in the nock README for more details](https://github.com/nock/nock?tab=readme-ov-file#axios).

This is problematic because the `axios` config will be different between your tests and what is actually run in production but that is a tradeoff that you may need to make.

## msw

[msw](https://mswjs.io/docs/) is another API mocking library which has good support for both browser and Node.js.

### Setup

Firstly, we need to setup `msw` so that it intercepts all HTTP requests. We use the `onHandledRequest` option to ensure that requests which do not match any HTTP mocks throw an error instead of executing a real HTTP request.

```ts
import { setupServer } from 'msw/node';

const server = setupServer();

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});
```

After all tests are run, we use `server.close()` to stop mocking the HTTP requests.

```ts
afterAll(() => {
  server.close();
});
```

`msw` calls the functions which mock out HTTP requests "handlers". After each test, we reset the handlers and remove the life cycle event listeners to ensure test isolation.

```ts
afterEach(() => {
  server.resetHandlers();
  server.events.removeAllListeners();
});
```

### Mocking when retrieving data

I use the [server.use](https://mswjs.io/docs/api/setup-server/use) method to add a handler for each specific test. I prefer adding the handler within the scope of the test for unit tests so that the handler setup is collocated with what we are testing.

A REST API handler is defined using [http](https://mswjs.io/docs/api/http) which has methods corresponding to the HTTP methods and it takes in a path and the [request handler](https://mswjs.io/docs/concepts/request-handler).

```ts
import { http } from 'msw';

server.use(
  http.get(`${baseUrl}/profiles/${profile.profileId}`),
  requestHandler,
);
```

We can return a HTTP response by using [HttpResponse](https://mswjs.io/docs/api/http-response/) in our request handler.

```ts
import { http, HttpResponse } from 'msw';

server.use(http.get(`${baseUrl}/profiles/${profile.profileId}`), () =>
  HttpResponse.json(profile),
);
```

Now I want to assert that the request sends an appropriate authorization header. The [philosophy of msw](https://mswjs.io/docs/philosophy) is to emulate what the server would do if we did not send authorization headers e.g. return a `401` status code. Request handlers take in a couple of parameters including the request that was sent to the server.

```ts
import { http, HttpResponse } from 'msw';

it('should return profile when calling getProfile', async () => {
  server.use(
    http.get(`${baseUrl}/profiles/${profile.profileId}`, ({ request }) => {
      if (request.headers.get('authorization') !== `Bearer ${bearerToken}`) {
        return new HttpResponse(null, {
          status: 401,
        });
      }
      return HttpResponse.json(profile);
    }),
  );

  const result = await profileDataSource.getProfile({
    bearerToken,
    profileId: profile.profileId,
  });

  expect(result).toEqual(profile);
});
```

### Mocking when sending data with response handled

When we are sending data to the server, I want to ensure that the server is receiving the right data.

```ts
type Payload = {
  name: string;
};
```

One approach is to assert that the server is receiving the expected data:

```ts {9,10}
server.use(
  http.post(`${baseUrl}/profiles`, async ({ request }) => {
    if (request.headers.get('authorization') !== `Bearer ${bearerToken}`) {
      return new HttpResponse(null, {
        status: 401,
      });
    }

    const body = await request.json();
    expect(body).toEqual({ name: profile.name });

    return HttpResponse.json(profile);
  }),
);
```

If we want to follow the philosophy of `msw`, we could also simply validate that the data in the payload has the right shape, similar to what the server would actually do. For example, I am using [zod](https://zod.dev/) to do a runtime check on the shape of the data.

```ts {13}
import { z } from 'zod';

it('should create a profile when calling createProfile', async () => {
  server.use(
    http.post(`${baseUrl}/profiles`, async ({ request }) => {
      if (request.headers.get('authorization') !== `Bearer ${bearerToken}`) {
        return new HttpResponse(null, {
          status: 401,
        });
      }

      const body = await request.json();
      if (!z.object({ name: z.string() }).safeParse(body).success) {
        return new HttpResponse(null, {
          status: 400,
        });
      }

      return HttpResponse.json(profile);
    }),
  );

  const result = await profileDataSource.createProfile({
    bearerToken,
    name: profile.name,
  });

  expect(result).toEqual(profile);
});
```

### Mocking when sending data with response unhandled

There's a few things that we want to assert in this test:

1. We are sending a network request at all
1. We are sending a network request to the correct URL with the correct method
1. We are sending a network request with the correct payload

Asserting that we are sending a network request to the correct URL and method is handled by the `onUnhandledRequest: 'error'` option that we set in our setup along with our `msw` handler.

Asserting that we are sending the correct payload is difficult because previously, we would validate the request payload in the `msw` handler and if the payload was incorrect, then we would have the handler return an unexpected status code resulting in the test failing. However, `sendProfileCreatedTrackingEvent` does not care about the response from the server so we can no longer use this approach.

Instead, we need to use the `msw` [life-cycle events](https://mswjs.io/docs/api/life-cycle-events) API to apply our assertions. `server.events.removeAllListeners()` which we setup in our `afterEach` block cleans up any event listeners that we will setup in this test.

Initially, I thought that we could do:

```ts
server.events.on('response:mocked', async ({ request }) => {
  const body = await request.clone().json();
  expect(body).toEqual({ profileId: profile.profileId });
});
```

`server.events.on('response:mocked')` sets up an event listener for `response:mocked` which is an event that is emitted whenever a mocked response is sent e.g. one of our `msw` handlers is invoked.

Note that before unpacking the `request` to `JSON`, I used `clone` to create a copy. This is noted in the [msw documentation](https://mswjs.io/docs/api/life-cycle-events#clone-before-reading).

This approach solves asserting that the request payload is correct, but there are two issues. We still have not solved assertion 1 because the test still passes when `sendProfileCreatedTrackingEvent` does not send a network request at all. You will also notice that since we are asserting on an event listener, the assertion will occur after the test finishes running which causes issues where when the assertion fails, the error is harder to read. Also, we cannot use `expect.hasAssertions` to assert that the network request occurred because `expect.hasAssertions` runs immediately after the test has finished running and so the assertion within the event listener has not been executed yet.

So, using the [wisdom from the maintainers](https://github.com/mswjs/msw/discussions/1927#discussioncomment-7862299), we can use a [DeferredPromise](https://github.com/open-draft/deferred-promise) to set the request body and assert that it is correct.

```ts {14-18,22-24}
import { DeferredPromise } from '@open-draft/deferred-promise';

it('should send tracking event with profileId when calling sendProfileCreatedTrackingEvent', async () => {
  server.use(
    http.post(
      `${baseUrl}/analytics/profile-created-event`,
      () =>
        new HttpResponse(null, {
          status: 200,
        }),
    ),
  );

  const requestBody = new DeferredPromise();
  server.events.on('response:mocked', async ({ request }) => {
    const body = await request.clone().json();
    requestBody.resolve(body);
  });

  await profileDataSource.sendProfileCreatedTrackingEvent(profile.profileId);

  await expect(requestBody).resolves.toEqual({
    profileId: profile.profileId,
  });
});
```

Installing an additional library which is an open draft to solve this particular scenario is not ideal.

### Error handling

Very similarly to the `nock` example, we can simply set up our `msw` mock server to always return an error and we will see the error that `axios` will actually throw when it receives an error from the server. We also use `expect.hasAssertions` in case `createProfile` never throws an error.

```ts
it('should throw error when server returns 500', async () => {
  expect.hasAssertions();
  server.use(
    http.post(
      `${baseUrl}/profiles`,
      async () =>
        new HttpResponse(null, {
          status: 500,
        }),
    ),
  );

  try {
    await profileDataSource.createProfile({
      bearerToken,
      name: profile.name,
    });
  } catch (error) {
    const axiosError = error as AxiosError;

    expect(axiosError.config?.headers).toMatchInlineSnapshot(`
        {
          "Accept": "application/json, text/plain, */*",
          "Accept-Encoding": "gzip, compress, deflate, br",
          "Authorization": "Bearer some-bearer-token",
          "Content-Length": "17",
          "Content-Type": "application/json",
          "User-Agent": "axios/1.7.3",
        }
      `);
  }
});
```

## Resource links

- [Source code](https://github.com/phillip-le/phillip-le.github.io/tree/main/src/examples/testing-network-requests)
