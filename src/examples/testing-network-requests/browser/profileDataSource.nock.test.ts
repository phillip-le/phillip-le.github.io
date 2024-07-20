// @vitest-environment jsdom
import nock from 'nock';
import { createProfileDataSource } from '../profileDataSource';
import type { Profile } from '../types';
import axios from 'axios';

// https://github.com/nock/nock?tab=readme-ov-file#axios
axios.defaults.adapter = 'http';

describe('profileDataSource - browser - nock', () => {
  const baseUrl = 'http://localhost:3250';
  const profile: Profile = {
    profileId: 'some-profile-id',
    name: 'Karina',
  };
  const bearerToken = 'some-bearer-token';

  const profileDataSource = createProfileDataSource(baseUrl);

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

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

    scope.isDone();
  });

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

  it('should send tracking event with profileId when calling sendProfileCreatedTrackingEvent', async () => {
    const scope = nock(baseUrl)
      .post('/analytics/profile-created-event', {
        profileId: profile.profileId,
      })
      .reply(200);

    await profileDataSource.sendProfileCreatedTrackingEvent(profile.profileId);

    scope.isDone();
  });
});
