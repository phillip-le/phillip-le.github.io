---
title: 'Running javascript package manager commands'
lastUpdated: 2024-07-20
---

Ever run `yarn` in a repository that uses `pnpm`? Stop thinking about which package manager to run commands with.

Use [@antfu/ni](https://github.com/antfu/ni) instead.

## Installation

```sh
pnpm add -g @antfu/ni
```

OR using [mise](https://mise.jdx.dev/plugins.html#plugins).

```sh
asdf plugin add ni https://github.com/CanRau/asdf-ni.git
asdf install ni latest
asdf global ni latest
```

## Usage

Running shell commands within the context of a project. Useful when I want to run a cli that is installed within a project but not exposed through the `package.json` scripts like `cdk` or `biome`.

```sh
na exec biome check --fix --unsafe
# equivalent to 'pnpm exec biome check --fix --unsafe'
```

`na` is the shorthand for running the current package manager e.g. `yarn` / `npm` / `pnpm`.
