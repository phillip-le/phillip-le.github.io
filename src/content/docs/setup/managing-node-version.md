---
title: "Managing node and package manager versions"
---

Manage the node and package manager versions by using [volta](https://docs.volta.sh/guide/). Also, standardise the versions of `node` and the package managers used in a repository with [volta's config](https://docs.volta.sh/guide/understanding#managing-your-project).

## Installation

Install `volta`

```sh
curl https://get.volta.sh | bash
```

Install default versions of node and package managers which are used when there are no package managers.

```sh
volta install node@20
volta install yarn@1
volta install pnpm
```

## Usage

Inside of a repository, you can pin the node version and package manager to use in the `package.json` file with the following commands:

```sh
volta pin node
volta pin pnpm
```

## Alternatives

1. [fnm](https://github.com/Schniz/fnm) node version manager built in Rust
1. [nvm.fish](https://github.com/jorgebucaran/nvm.fish) node version manager written in Fish
