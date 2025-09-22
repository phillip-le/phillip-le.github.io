---
title: 'Sourcemaps'
lastUpdated: 2025-09-22
---

When you want to improve performance, you may choose to minimize bundle size by choosing to [minify](https://esbuild.github.io/api/#minify) the bundle size
using `--minify`. This can be problematic when using stacktraces for debugging because the stacktrace will include the minified lines of code which do not
line up with your source code at all.

One way of retaining the value of stacktraces is by adding sourcemaps. You can add sourcemaps using `esbuild` by adding the `sourcemap=linked` flag or adding the config in your build script:

```diff lang="ts"
+    sourcemap: 'linked',
```

You will also need to enable source maps in your `NODE_OPTIONS` environmental variable for your application.

`NODE_OPTIONS: '--enable-source-maps`

This will add a new `.map` file which can be quite large. This is usually not a problem for performance because it's only loaded when an error occurs. See [this article](https://dev.to/aws-builders/how-to-use-source-maps-in-typescript-lambda-functions-with-benchmarks-4bo4) for some benchmarks.

One method dramatically reducing the bundle size of the sourcemaps is by excluding building sourcemaps for `node_modules` as suggested by: https://github.com/evanw/esbuild/issues/1685

This was broken in `esbuild@0.25.2` with a workaround noted in: https://github.com/evanw/esbuild/issues/4130

So, the end result is that you can add source maps with minimal addition to the bundle size.
