---
title: 'Type safety in tests'
lastUpdated: 2024-07-14
---

### Why is this important?

Having strong type safety allows us to be more confident that what we are testing can actually happen. It also gives us `Intellisense` making it easier to explore the shape of the data we need to provide.

### Adding a type to `toEqual` and `toHaveBeenCalledWith`

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

I already know that the result of `sum` must be a `number` but the `toEqual` matcher does not know that. Handily, the `toEqual` matcher is a generic function which means that we can pass in the type that we expect:

```ts
// Argument of type 'string' is not assignable to parameter of type 'number'
expect(sum(1, 1)).toEqual<number>('2');
```

Now, TypeScript helpfully tells us that what we are trying to assert will never happen. This helps us cut down on the number of test cases that we need to maintain.

An extension of this is that we can generate the return type of `sum` so that we do not need to maintain the type that we pass to the `toEqual` matcher.

```ts
expect(sum(1, 1)).toEqual<ReturnType<typeof sum>>(2);
```

Suppose that `sum` was actually an `async` function:

```ts
export const sumAsync = (a: number, b: number): Promise<number> =>
  Promise.resolve(a + b);
```

To generate the return type of `sumAsync` we would need to remove the `Promise`:

```ts
const result = await sum(1, 1);

expect(result).toEqual<Awaited<ReturnType<typeof sumAsync>>>(2);
```
