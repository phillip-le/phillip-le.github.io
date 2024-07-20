import request, { type AxiosRequestConfig } from 'axios';
// @vitest-environment node
import { createProfileDataSource } from '../profileDataSource';
import type { Profile } from '../types';

vi.mock('axios');

describe('profileDataSource - browser - mock axios', () => {
  const baseUrl = 'http://localhost:3250';
  const profile: Profile = {
    profileId: 'some-profile-id',
    name: 'Karina',
  };
  const bearerToken = 'some-bearer-token';

  const profileDataSource = createProfileDataSource(baseUrl);

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return profile when calling getProfile', async () => {
    vi.mocked(request).mockResolvedValueOnce({ data: profile });

    const result = await profileDataSource.getProfile({
      bearerToken,
      profileId: profile.profileId,
    });

    expect(result).toEqual(profile);
    expect(request).toHaveBeenCalledWith<[AxiosRequestConfig]>(
      expect.objectContaining<AxiosRequestConfig>({
        url: `/profiles/${profile.profileId}`,
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }),
    );
  });

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

  it('should send tracking event with profileId when calling sendProfileCreatedTrackingEvent', async () => {
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
});
