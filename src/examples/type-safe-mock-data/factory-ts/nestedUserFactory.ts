import { makeFactory } from 'factory.ts';
import type { User } from './types';

export const userFactory = makeFactory<User>({
  firstName: 'John',
  location: {
    current: 'New York',
    homeTown: 'Munich',
  },
});
