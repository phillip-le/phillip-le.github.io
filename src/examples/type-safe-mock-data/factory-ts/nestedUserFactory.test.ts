import { type User, userFactory } from './nestedUserFactory';

describe('nestedUserFactory', () => {
  it('should return the default user when no overrides are passed in', () => {
    const user = userFactory.build();

    expect(user).toEqual<User>({
      firstName: 'John',
      location: {
        current: 'New York',
        homeTown: 'Munich',
      },
    });
  });

  it('should return user with homeTown of Melbourne when nested override is passed in', () => {
    const userWithMelbourne = userFactory.build({
      location: {
        homeTown: 'Melbourne',
      },
    });

    expect(userWithMelbourne).toEqual<User>({
      firstName: 'John',
      location: {
        current: 'New York',
        homeTown: 'Melbourne',
      },
    });
  });
});
