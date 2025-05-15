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

### esbuild

Set the format to `esm`:

```sh ins="--format=esm"
esbuild ./src/index.ts --bundle --platform=node --format=esm
```

```ts
// build-script.ts
import { BuildOptions } from 'esbuild';
{
  format: 'esm',
} satisfies BuildOptions;
```

**Using `esbuild` bundled application with AWS Lambda**

Ensure that you output your files with the `.mjs` extension:

```sh ins="--outfile=./build/index.mjs"
esbuild ./src/index.ts --outfile=./build/index.mjs --bundle --platform=node --format=esm
```

```ts
// build-script.ts
import { BuildOptions } from 'esbuild';
{
  format: 'esm',
  outfile: './build/index.mjs'
} satisfies BuildOptions;
```

This resolves the following error:

```json
{
  "timestamp": "2025-05-14T13:26:00.828Z",
  "level": "ERROR",
  "message": "(node:8) Warning: To load an ES module, set \"type\": \"module\" in the package.json or use the .mjs extension."
}
```

```json
{
  "timestamp": "2025-05-14T13:26:00.829Z",
  "level": "ERROR",
  "message": {
    "errorType": "UserCodeSyntaxError",
    "errorMessage": "SyntaxError: Cannot use import statement outside a module",
    "stackTrace": [
      "Runtime.UserCodeSyntaxError: SyntaxError: Cannot use import statement outside a module",
      "    at _loadUserApp (file:///var/runtime/index.mjs:1084:17)",
      "    at async UserFunction.js.module.exports.load (file:///var/runtime/index.mjs:1119:21)",
      "    at async start (file:///var/runtime/index.mjs:1282:23)",
      "    at async file:///var/runtime/index.mjs:1288:1"
    ]
  }
}
```

Also, ensure that you add the following banner as noted in [this GitHub issue](https://github.com/evanw/esbuild/issues/1921#issuecomment-1152991694):

```sh
esbuild ./src/index.ts --banner:js=\"import { createRequire } from 'module';const require = createRequire(import.meta.url);\" --outfile=./build/index.mjs --bundle --platform=node --format=esm
```

```ts
import { BuildOptions } from 'esbuild';
const buildOptions = {
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
  format: 'esm',
  outfile: './build/index.mjs',
} satisfies BuildOptions;
```

To resolve the following error:

```json
{
    "timestamp": "2025-05-15T00:27:41.191Z",
    "level": "ERROR",
    "message": {
        "errorType": "Error",
        "errorMessage": "Dynamic require of \"querystring\" is not supported",
        "stackTrace": [
            "Error: Dynamic require of \"querystring\" is not supported",
            ...
            "    at ModuleJob.run (node:internal/modules/esm/module_job:271:25)",
            "    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:578:26)",
            "    at async _tryAwaitImport (file:///var/runtime/index.mjs:1008:16)",
            "    at async _tryRequire (file:///var/runtime/index.mjs:1057:86)",
            "    at async _loadUserApp (file:///var/runtime/index.mjs:1081:16)",
            "    at async UserFunction.js.module.exports.load (file:///var/runtime/index.mjs:1119:21)",
            "    at async start (file:///var/runtime/index.mjs:1282:23)",
            "    at async file:///var/runtime/index.mjs:1288:1"
        ]
    }
}
```

### prettier

Update your `prettier` config from `.js` to `.mjs` and `.ts` to `.mts`.

Update the exports of your config from

```diff lang="js"
-module.exports = {
+export default {
```

### dependency-cruiser

Update your `dependency-cruiser` config from `.js` to `.mjs` and `.ts` to `.mts`.

Update the exports of your config from

```diff lang="js"
-module.exports = {
+export default {
```

### Test Runner

If you are using [jest](https://jestjs.io/), you will want to migrate to using [vitest](https://vitest.dev/). Fortunately, there is [good documentation](https://vitest.dev/guide/migration.html#jest) and [robust codemods](https://docs.grit.io/patterns/library/jest_to_vitest) that make this easier.

### Linting

It can also be good to enable some linting rules to help adjust to the differences between CommonJS and ESM:

- [unicorn/prefer-module](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-module.md)

### Additional resources

- [sindresorhus/esm-package.md](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). Personally I did not find this to be very helpful but it is one of the more common resources that are linked to when running into issues with importing ESM packages.
