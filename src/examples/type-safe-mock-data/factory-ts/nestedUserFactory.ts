import { faker } from '@faker-js/faker';
import { makeFactory } from 'factory.ts';

export type User = {
  firstName: string;
  location: {
    homeTown: string;
    current: string;
  };
};

export const userFactory = makeFactory<User>({
  firstName: 'John',
  location: {
    current: 'New York',
    homeTown: 'Munich',
  },
});

export const userFactoryWithFaker = makeFactory<User>(() => ({
  firstName: faker.person.firstName(),
  location: {
    current: faker.location.city(),
    homeTown: faker.location.city(),
  },
}));
