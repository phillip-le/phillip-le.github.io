import nock from 'nock';
import { createProfileDataSource } from '../profileDataSource';
import type { Profile } from '../types';

describe('profileTest', () => {
  const baseUrl = 'http://localhost';

  const doTheThings = async (url: string) => {
    const profileDataSource = createProfileDataSource(url);

    await profileDataSource.createProfile({ name: 'John', bearerToken: 'XXX' });

    await profileDataSource.sendProfileCreatedTrackingEvent('12345');

    const profile = await profileDataSource.getProfile({
      profileId: '12345',
      bearerToken: 'XXX',
    });
    return profile;
  };

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock(baseUrl)
      .post('/profiles', {
        name: 'John',
      })
      .reply(200, {
        profileId: '12345',
        name: 'John',
      })
      .post('/analytics/profile-created-event')
      .reply(200)
      .get('/profiles/12345')
      .reply(200, {
        profileId: '12345',
        name: 'John',
      });

    nock('http://google.com')
      .post('/profiles', {
        name: 'John',
      })
      .reply(200, {
        profileId: '12345',
        name: 'John',
      })
      .post('/analytics/profile-created-event')
      .reply(200)
      .get('/profiles/12345')
      .reply(200, {
        profileId: '12345',
        name: 'John',
      });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should do the things', async () => {
    const profile = await doTheThings(baseUrl);

    expect(profile).toEqual<Profile>({
      profileId: '12345',
      name: 'John',
    });
  });
});
