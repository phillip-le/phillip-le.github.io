import { DeferredPromise } from '@open-draft/deferred-promise';
import type { AxiosError } from 'axios';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
// @vitest-environment jsdom
import { createProfileDataSource } from '../profileDataSource';
import { type Profile, ProfileSchema } from '../types';

describe('profileDataSource - browser - msw', () => {
  const baseUrl = 'http://localhost:3250';
  const profile: Profile = {
    profileId: 'some-profile-id',
    name: 'Karina',
  };
  const bearerToken = 'some-bearer-token';

  const profileDataSource = createProfileDataSource(baseUrl);

  const server = setupServer();

  beforeAll(() => {
    server.listen({
      onUnhandledRequest: 'error',
    });
  });

  afterEach(() => {
    server.resetHandlers();
    server.events.removeAllListeners();
  });

  afterAll(() => {
    server.close();
  });

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

  it('should create a profile when calling createProfile', async () => {
    server.use(
      http.post(`${baseUrl}/profiles`, async ({ request }) => {
        if (request.headers.get('authorization') !== `Bearer ${bearerToken}`) {
          return new HttpResponse(null, {
            status: 401,
          });
        }

        const body = await request.json();
        if (
          !ProfileSchema.omit({
            profileId: true,
          }).safeParse(body).success
        ) {
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

    // https://github.com/mswjs/msw/discussions/1927#discussioncomment-7862299
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
          "Authorization": "Bearer some-bearer-token",
          "Content-Type": "application/json",
        }
      `);
    }
  });
});
