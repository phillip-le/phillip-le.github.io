---
title: Named parameters in TypeScript
lastUpdated: 2024-10-25
---

## Named parameters

One of the problems with having multiple parameters with the same type passed into a function is that it can create subtle bugs.

```ts
const createFullName = (firstName: string, lastName: string) => {
  return `${firstName} ${lastName}`;
};

const fullName = createFullName('John', 'Smith'); // John Smith
```

If we changed the order of the parameters, then the function would still run and generate a `string` that resembles the correct answer.

```ts
const createFullName = (lastName: string, firstName: string) => {
  return `${firstName} ${lastName}`;
};

const fullName = createFullName('John', 'Smith'); // Smith John !== John Smith
```

One of the ways we change this is by passing parameters in as an object.

```ts
const createFullName = (params: { firstName: string; lastName: string }) => {
  const { firstName, lastName } = params;
  return `${firstName} ${lastName}`;
};

const fullName = createFullName({
  firstName: 'John',
  lastName: 'Smith',
}); // John Smith
```

We can also destructure the object in the function parameters.

```ts
const createFullName = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => {
  return `${firstName} ${lastName}`;
};
```

This is a common pattern for having named parameters in TypeScript.

## Default parameters

Sometimes we want optional parameters with default values. When we pass in each parameter one at a time, we would have a function like this.

```ts
const createFullName = (firstName: string, lastName: string = 'Smith') => {
  return `${firstName} ${lastName}`;
};

const fullNameWithDefaultLastName = createFullName('John');
// John Smith

const fullNameWithDifferentLastName = createFullName('John', 'Apples');
// John Apples
```

What if we wanted to have default parameter values with an object? We can destructure the `params` object and give default values.

```ts
const createFullName = (params: { firstName: string; lastName?: string }) => {
  const { firstName, lastName = 'Smith' } = params;
  return `${firstName} ${lastName}`;
};

const fullNameWithDefaultLastName = createFullName({
  firstName: 'John',
}); // John Smith

const fullNameWithDiffLastName = createFullName({
  firstName: 'John',
  lastName: 'Apples',
}); // John Apples
```

We can also give default values when destructuring the parameters in the function parameters.

```ts {3}
const createFullName = ({
  firstName,
  lastName = 'Smith',
}: {
  firstName: string;
  lastName?: string;
}) => {
  return `${firstName} ${lastName}`;
};
```

For more complex `params` types, we can also abstract `params` into a separate type.

```ts
type FullName = {
  firstName: string;
  lastName?: string;
};

const createFullName = (params: FullName) => {
  const { firstName, lastName = 'Smith' } = params;
  return `${firstName} ${lastName}`;
};
```
