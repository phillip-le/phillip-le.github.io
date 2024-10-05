---
title: Validating floating point number input in JavaScript
lastUpdated: 2024-10-03
---

Floating point numbers are notoriously difficult to work with because they are not precise.

```sh title="node"

> 0.1 * 0.2
0.020000000000000004
```

If you really need to manipulate floating point numbers, you are probably better off using a dedicated library like [big.js](https://www.npmjs.com/package/big.js).

But, if your system is just passing through floating point numbers, you may be able to get away with accepting the numbers as a `string` and preserving that value through your system.

However, how do you know if the `string` you were given is a valid floating point number?

This article explores how to validate floating point number input in JavaScript, the various pitfalls you may encounter, and how to avoid them.

For the purposes of this article, a valid floating point number is a number that looks like `123.456` or `-123.456`.

How hard could it be?

## The pitfalls of `Number()` and `parseFloat()`

The first idea you may have is to check if the `string` can be parsed as a `number` using [Number()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) or [parseFloat()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat).

Ok, let's try that.

```sh title="Simple inputs"
> Number(20)
20
> Number(20.01)
20.01
```

Looking good!

What happens if we give it something completely wrong?

```sh
> Number('hello')
NaN
```

What is `NaN`?

```sh
> typeof Number('hello')
'number'
```

Ok, it looks like we need to check if it is `NaN`.

```ts
export const isValidNumber = (value: string): boolean => {
  const number = Number(value);
  return !Number.isNaN(number);
};
```

What about whitespace?

```sh title="Whitespace"
> Number( 20)
20
> Number(20 )
20
```

Oh no, looks like `Number()` doesn't handle whitespace very well.

```sh title="Different number formats"
> Number(020)
16
> Number(20e5)
2000000
> Number(0xA)
10
```

Oh, looks like `Number()` also supports different number formats.

Are there any other weird values that `Number()` will accept?

```sh title="Infinity"
> Number(Infinity)
Infinity
> Number(-Infinity)
-Infinity
> Number("Infinity")
Infinity
```

Ah, yes `Infinity` and `-Infinity` are `number` values in JavaScript.

`parseFloat()` mostly behaves the same way but it has the bonus of accepting arbitrary characters if the start of the string looks like a floating point number.

```sh title="Trailing characters"
> parseFloat("123.456")
123.456
> parseFloat("123.456abc")
123.456
```

## What about `lodash`?

`lodash` the library with a function for everything also has one called [\_.isNumber](https://lodash.com/docs/4.17.15#isNumber).

Oh but it looks like it accepts values like "Infinity" as well.

```ts
_.isNumber('Infinity');
// => true
```

## What about `zod`?

`zod` is a popular runtime validation library that is often used to validate input data.

```ts
import { z } from 'zod';

const schema = z.number();
```

To validate a string as a number, we need to use
