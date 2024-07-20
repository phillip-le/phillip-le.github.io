// @vitest-environment node
import { createProfileDataSource } from '../profileDataSource';
import { ProfileSchema, type Profile } from '../types';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

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

    server.events.on('request:start', async ({ request }) => {
      const body = await request.clone().json();

      const { profileId } = ProfileSchema.pick({ profileId: true }).parse(body);

      expect(profileId).toEqual(profile.profileId);
    });

    await profileDataSource.sendProfileCreatedTrackingEvent(profile.profileId);
  });
});
