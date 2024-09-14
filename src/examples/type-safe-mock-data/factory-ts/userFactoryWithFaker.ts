import { faker } from '@faker-js/faker';
import { makeFactory } from 'factory.ts';
import type { User } from './types';

export const userFactoryWithFaker = makeFactory<User>(() => ({
  firstName: faker.person.firstName(),
  location: {
    current: faker.location.city(),
    homeTown: faker.location.city(),
  },
}));
