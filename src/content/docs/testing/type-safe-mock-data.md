---
title: 'Type safe mock data'
lastUpdated: 2024-07-09
---

Often, I find that when I am writing tests, I do not necessarily want to provide robust mock data or implementations because they are not necessary for a test.

Suppose we have a `User` that looks like:

```ts
type User = {
  firstName: string;
  lastName: string;
  age: number;
  // ... many other fields
};
```

And I wanted to test a function like:

```ts
const getFullName = (user: User) => `${user.firstName} ${user.lastName}`;
```

For our test, while I could provide a full mock object:

```ts
it('should return full name', () => {
  const user: User = {
    firstName: 'John',
    lastName: 'Smith',
    age: 15,
    balance: 12_000,
    // etc
  };

  const result = getFullName(user);

  expect(result).toEqual('John Smith');
});
```

My function only really cares about `firstName` and `lastName`. In our test, we could create a mock `User` with only the `firstName` and `lastName` and [type assert](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions) that it is a valid `User`.

```ts
it('should return full name', () => {
  const user = {
    firstName: 'John',
    lastName: 'Smith',
  } as User;

  const result = getFullName(user);

  expect(result).toEqual('John Smith');
});
```

The advantage of this is that:

1. We do not need to provide all the values to form a valid `User` object
1. We get `IntelliSense` support
1. When we try to put an invalid data type into a valid key e.g. `firstName: 1` then TypeScript will give us an error

However, if we instantiate the `User` object with unknown keys or if the type of `User` changes so that a key is removed or renamed, TypeScript will not tell us that we are providing invalid keys because we are telling TypeScript that we know that this should be a `User` object.

```ts "invalid: 'key'"
const user = {
  firstName: 'John',
  lastName: 'Smith',
  invalid: 'key',
} as User;
```

### Adding type safety with a `Partial` type annotation

A better way of creating our mock object would be to use a [type annotation](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-annotations-on-variables) with the [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype) utility type as well as the type assertion.

```ts
it('should return full name', () => {
  const user: Partial<User> = {
    firstName: 'John',
    lastName: 'Smith',
  };

  const result = getFullName(user as User);

  expect(result).toEqual('John Smith');
});
```

Using a type annotation will tell us when we are instantiating an object with invalid keys. The `Partial` utility type is used to say that `user` only needs to have some of the keys of the `User` type. We still need to use a type assertion when passing the `user` object to `getFullName` because `getFullName` expects a `User` and not a partial version of `User`. We know that `getFullName` should only require `firstName` and `lastName` so we use the type assertion to override TypeScript in this instance.

Another approach is to create valid objects every time.

```ts
const user: User = {
  firstName: 'John',
  lastName: 'Smith',
  age: 15,
  credits: 30_000,
  interests: ['karaoke', 'snowboarding'],
  // etc
};
```

But this can make it more difficult for the reader to understand what exactly causes the test to pass/fail. One approach to solving this is to use a base mock object with valid data and using [spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) to fill out the fields that do not matter.

```ts
const user: User = {
  ...baseUser,
  firstName: 'Jane',
  lastName: 'Lee',
};
```

A bad implementation of this approach is when the test relies on specific attributes of the base mock object for the test to pass/fail, but it is not obvious in the test case without the reader diving into the base object.

```ts
it('should return full name', () => {
  const user: User = {
    ...baseUser,
    firstName: 'Jane',
  };

  const result = getFullName(user);

  // Where does 'Smith' come from??
  expect(result).toEqual('Jane Smith');
});
```

So, when using this approach you should override all of the relevant attributes that make a test pass/fail even if the test would pass spread from the attributes of the base object anyway.

```ts
it('should return full name', () => {
  const user: User = {
    ...baseUser,
    firstName: 'Jane',
    lastName: 'Lee',
  };

  const result = getFullName(user);

  expect(result).toEqual('Jane Lee');
});
```

### The troubles with nested data

So far, we have used the `User` object as an example which is convenient because it does not have nested fields. This is usually not the case.

```ts
type User = {
  firstName: string;
  location: {
    homeTown: string;
    current: string;
  };
};
```

The `Partial` utility type will now no longer be as useful because `Partial` only applies one level deep.

```ts
const user: Partial<User> = {
  location: {
    homeTown: 'New York',
  },
};
```

Giving the error:

```sh
Property 'current' is missing in type '{ homeTown: "New York"; }' but required in type '{ homeTown: "New York"; current: "Munich"; }'
```

Instead, we can use [PartialDeep](https://github.com/sindresorhus/type-fest/blob/main/source/partial-deep.d.ts) from `type-fest` or define your own:

```ts
// credit to https://stackoverflow.com/questions/61132262/typescript-deep-partial
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
```

For example,

```ts
const user: DeepPartial<User> = {
  location: {
    homeTown: 'New York',
  },
};
```

If we wanted to create valid objects every time, we will find that spread syntax also does not work well with nesting:

```ts
const baseUser: User = {
  firstName: 'John',
  location: {
    homeTown: 'New York',
    current: 'Munich',
  },
};

const user: Partial<User> = {
  ...baseUser,
  location: {
    homeTown: 'New York',
  },
};
```

Giving the following error:

```sh
Property 'current' is missing in type '{ homeTown: string; }' but required in type '{ homeTown: string; current: string; }'
```

We could spread for every nested property we want to override:

```ts
const user: Partial<User> = {
  ...baseUser,
  location: {
    ...baseUser.location,
    homeTown: 'New York',
  },
};
```

Which would work, but quickly becomes overly cumbersome. I have found that [factory.ts](https://www.npmjs.com/package/factory.ts) offers a very clean way of modifying nested attributes while also easing the creation of new isolated test data for each test.

For each type we want to create mock data for, we create a `Factory` with the default values we want for our mock data similar to the base object we had before.

```ts
import { makeFactory } from 'factory.ts';

export const userFactory = makeFactory<User>({
  firstName: 'John',
  location: {
    current: 'New York',
    homeTown: 'Munich',
  },
});
```

When we want to create a user object, we can use the `.build` method:

```ts
const user = userFactory.build();

expect(user).toEqual<User>({
  firstName: 'John',
  location: {
    current: 'New York',
    homeTown: 'Munich',
  },
});
```

To override an attribute, we can pass in a `DeepPartial<User>` with the attributes we want to override to the `.build` method.

```ts
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
```

Sometimes, we want to ensure that our tests are isolated by providing completely different data. A combination of `factory.ts` and [@faker-js/faker](https://www.npmjs.com/package/factory.ts) can be excellent for generating large amounts of fake data, while also allowing us to easily override the attributes we need for a test to pass/fail.

```ts
import { makeFactory } from 'factory.ts';
import { faker } from '@faker-js/faker';

export const userFactoryWithFaker = makeFactory<User>(() => ({
  firstName: faker.person.firstName(),
  location: {
    current: faker.location.city(),
    homeTown: faker.location.city(),
  },
}));
```

