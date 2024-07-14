---
title: 'Enums in TypeScript'
sidebar:
  hidden: true
---

### What are enums for?

Enums represent a limited set of values. For example, the days of the week could be represented as an enum. It is helpful to define types narrowly so that `TypeScript` can help us.

For example, suppose that we needed to have a short hand for every day of the week. If our days of the week was a `string`

Cons

- No `IntelliSense` discoverability
- You may find that the support for enums with other technologies to be good or poor like with [GraphQL](https://typegraphql.com/docs/enums.html)
- Without understanding the pitfalls of different variants of enums, bad variants can be unknowingly added to a codebase and then become very hard to remove if they are then used in persisted datastores

Pros

- Good if you want to enforce always using the enum value instead of the underlying literal value which may be less readable
