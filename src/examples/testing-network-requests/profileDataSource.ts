import request from 'axios';
import type { Profile, ProfileDataSource } from './types';

export const createProfileDataSource = (baseUrl: string): ProfileDataSource => {
  return {
    getProfile: async ({ bearerToken, profileId }) => {
      const response = await request<Profile>({
        url: `/profiles/${profileId}`,
        baseURL: baseUrl,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        validateStatus: (status) =>
          status >= 200 || status < 300 || status === 404,
      });

      if (response.status === 404) {
        return null;
      }

      return response.data;
    },
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
};
