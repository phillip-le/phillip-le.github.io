---
title: 'Type safety in tests'
lastUpdated: 2024-07-14
---

### Why is this important?

Having strong type safety allows us to be more confident that what we are testing can actually happen. It also gives us `Intellisense` making it easier to explore the shape of the data we need to provide.

### Adding types to `toEqual`

By default, `jest` and `vitest` will use `unknown` or `any` as the type for the data we want to assert when using the `toEqual` and `toHaveBeenCalledWith` matchers.

For example, consider the following function:

```ts
const sum = (a: number, b: number): number => a + b;
```

The following test will fail when we run it:

```ts
expect(sum(1, 1)).toEqual('2');
```

Can we move this runtime error to a compile time error? Looking at the function signature

```ts
(a: number, b: number) => number;
```

I already know that the result of `sum` must be a `number` but the `toEqual` matcher does not know that. Conveniently, the `toEqual` matcher is a generic function which means that we can pass in the type that we expect:

```ts "number"
// Argument of type 'string' is not assignable to parameter of type 'number'
expect(sum(1, 1)).toEqual<number>('2');
```

Now, TypeScript helpfully tells us that what we are trying to assert will never happen. This helps us cut down on the number of test cases that we need to maintain.

An extension of this is that we can generate the return type of `sum` so that we do not need to maintain the type that we pass to the `toEqual` matcher. We can do this using the [ReturnType](https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype) utility type.

```ts "ReturnType<typeof sum>"
expect(sum(1, 1)).toEqual<ReturnType<typeof sum>>(2);
```

Suppose that `sum` was actually an `async` function:

```ts
export const sumAsync = (a: number, b: number): Promise<number> =>
  Promise.resolve(a + b);
```

To generate the return type of `sumAsync` we would need to remove the `Promise`. We could do this using the [Awaited](https://www.typescriptlang.org/docs/handbook/utility-types.html#awaitedtype) utility type.

```ts "Awaited<ReturnType<typeof sumAsync>>"
const result = await sum(1, 1);

expect(result).toEqual<Awaited<ReturnType<typeof sumAsync>>>(2);
```

### Adding types to `toHaveBeenCalledWith`

You can also pass `toHaveBeenCalledWith` a type. Consider the following function:

```ts
export const createUser = async ({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) => {
  await trackUserCreated({
    userId,
    name,
  });

  return {
    userId,
  };
};
```

Where `trackUserCreated` is defined as:

```ts
export const trackUserCreated = ({}: { userId: string; name: string }) =>
  Promise.resolve();
```

We could assert that `trackUserCreated` was called correctly like this:

```ts {2-7}
expect(trackUserCreated).toHaveBeenCalledWith<
  [
    {
      userId: string;
      name: string;
    },
  ]
>({
  userId: 'user-id',
  name: 'James',
});
```

Notice that the type we pass into `toHaveBeenCalledWith` is a [tuple](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types). This is because functions take in an array of parameters. So, when our type is

```ts
type TrackUserCreatedParameters = [
  {
    userId: string;
    name: string;
  },
];
```

We are asserting that `trackUserCreated` is a function that only takes in one parameter.

Let's take a look at what happens when we have multiple parameters:

```ts
export const trackUserCreatedMultipleArgs = (_userId: string, _name: string) =>
  Promise.resolve();
```

Now, our assertion looks like:

```ts "[string, string]"
expect(trackUserCreatedMultipleArgs).toHaveBeenCalledWith<[string, string]>(
  'user-id',
  'James',
);
```

Notice now that when we have multiple parameters, we simply add to the tuple of parameters.

Similarly to `toEqual` we can generate the types for our assertions.

```ts "Parameters<typeof trackUserCreated>" "Parameters<typeof trackUserCreatedMultipleArgs>"
expect(trackUserCreated).toHaveBeenCalledWith<
  Parameters<typeof trackUserCreated>
>({
  userId: 'user-id',
  name: 'James',
});
expect(trackUserCreatedMultipleArgs).toHaveBeenCalledWith<
  Parameters<typeof trackUserCreatedMultipleArgs>
>('user-id', 'James');
```

The [Parameters](https://www.typescriptlang.org/docs/handbook/utility-types.html#parameterstype) utility type handles both `trackUserCreated` and `trackUserCreatedMultipleArgs` easily.

