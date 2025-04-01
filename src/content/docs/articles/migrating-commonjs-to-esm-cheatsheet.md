---
title: 'Migrating CommonJS to ESM Cheatsheet'
---

ESM is the new modern way of doing things but migrating from CommonJS to ESM feels like working on a house of cards. Each part of your setup that you have slowly accumulated of the year may need to be replaced.

:::caution
Do you even **need** to migrate from CommonJS to ESM? From Node 20, you can [use synchronous ESM packages](https://joyeecheung.github.io/blog/2024/03/18/require-esm-in-node-js/) without making the jump.

The main caveats are that the feature is _experimental_ (but it is enabled by default) and you cannot import packages that use top level `await`.
:::

### Switching your project to ESM

The easiest change is to switch the `type` in your `package.json`. CommonJS is the default and your project is assumed to be CommonJS if `type` is omitted.

```diff lang="json"
// package.json
{
  "name": "my-project",
+  "type": "module",
  "version": "0.0.1",
  // ...
}
```

### `tsconfig.json`

If you are using TypeScript, you'll need to look at your `tsconfig.json`. The best resource for this is [Total TypeScript's TSConfig Cheat Sheet](https://www.totaltypescript.com/tsconfig-cheat-sheet), specifically the advice around whether you are transpiling with TypeScript or not transpiling with TypeScript (e.g. using `esbuild`).

### Running a hot reloading local dev server

One of the more common ways of having a hot reloading local dev server is to use [ts-node](https://www.npmjs.com/package/ts-node) which will no longer work well.

A common alternative is [tsx](https://github.com/privatenumber/tsx) which is a great alternative for **simple** use cases. However, if you use [TypeScript's path aliases](https://www.typescriptlang.org/tsconfig/#paths) then you will quickly run into problems due to `tsx`'s no config approach.

My recommendation is to use [vite-node](https://www.npmjs.com/package/vite-node) which you can configure using the standard [vite config](https://vite.dev/config/). Your `vite` config can also be shared with `vitest` if you use it.

```ts
// vitest.config.ts
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
});
```

### Test Runner

If you are using [jest](https://jestjs.io/), you will want to migrate to using [vitest](https://vitest.dev/). Fortunately, there is [good documentation](https://vitest.dev/guide/migration.html#jest) and [robust codemods](https://docs.grit.io/patterns/library/jest_to_vitest) that make this easier.

### Additional resources

- [sindresorhus/esm-package.md](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). Personally I did not find this to be very helpful but it is one of the more common resources that are linked to when running into issues with importing ESM packages.
