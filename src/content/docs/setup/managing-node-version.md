---
title: 'Managing node and package manager versions'
lastUpdated: 2025-06-11
---

## mise

[mise](https://mise.jdx.dev/) is a new up and coming "everything" version manager? See [this nice breakdown](https://ricostacruz.com/posts/mise-vs-volta) on the differences between `mise` and `volta`.

### Installation

```sh
brew install mise
mise use -g node@22
mise use -g npm:@antfu/ni
```

```diff
// ~/.config/mise/config.toml
[tools]
node = "22"
"npm:@antfu/ni" = "latest"

[settings]
idiomatic_version_file_enable_tools = ["node"]
```

Verify that it is working.

```sh
mise doctor
```

You don't need to add `mise` to the `PATH` because it adds itself to the `PATH`.

### Usage

`mise` can read the required node version from [`.nvmrc` and `.node-version`](https://mise.jdx.dev/lang/node.html#nvmrc-and-node-version-support) with the `idiomatic_version_file_enable_tools` setting.

```sh
mise missing: node@18.20.4
$ mise install
```

You can install `npm` tools and have `mise` manage them across all of your `node` versions:

```sh
mise use -g npm:prettier
```

## Alternatives

### volta

Manage the `node` and package manager versions by using [volta](https://docs.volta.sh/guide/). Volta also allows you to standardise the versions of `node` and the package managers used in a repository with [volta's config](https://docs.volta.sh/guide/understanding#managing-your-project).

Great if you can enforce using `volta` across all of the codebases you work in or you can consistently rely on a default version of `node`. Not great if you need to use the version of `node` specified in a `.nvmrc` file.

#### Installation

Install `volta`.

```sh
curl https://get.volta.sh | bash
```

Install default versions of node and package managers which are used when there are no package managers.

```sh
volta install node@20
volta install yarn@1
volta install pnpm
```

#### Usage

Inside of a repository, you can pin the node version and package manager to use in the `package.json` file with the following commands:

```sh
volta pin node
volta pin pnpm
```

### fnm

If you need to use the version of `node` specified in a `.nvmrc` or `.node-version` file, use [fnm](https://github.com/Schniz/fnm), a node version manager built in Rust. One of the key selling points is that it can change the version of `node` when you change directories.

#### Installation

Install `fnm`.

```sh
curl -fsSL https://fnm.vercel.app/install | bash
```

Setup `fish` according to [these instructions](https://github.com/Schniz/fnm?tab=readme-ov-file#fish-shell). Add the `--use-on-cd` option to the `fnm` to change `node` version when you change directories.

```sh "--use-on-cd"
// ~/.config/fish/conf.d/fnm.fish
fnm env --use-on-cd | source
```

Add the `--corepack-enabled` option to use corepack to manage package managers like `pnpm` and `yarn`.

```sh "--corepack-enabled"
// ~/.config/fish/conf.d/fnm.fish
fnm env --use-on-cd --corepack-enabled | source
```

See other `fnm` options [here](https://github.com/Schniz/fnm/blob/master/docs/configuration.md).

Add fish auto complete.

```sh
touch ~/.config/fish/completions/fnm.fish
fnm completions --shell fish > ~/.config/fish/completions/fnm.fish
```

Restart your terminal.

### nvm.fish

[nvm.fish](https://github.com/jorgebucaran/nvm.fish) is another performant node version manager written in Fish that respects `.nvmrc` and `.node-version` files. Unfortunately, it does not have native support for changing the `node` version when changing directories.

Take a look at [this comment](https://github.com/jorgebucaran/nvm.fish/pull/186#issuecomment-1142412874) to see a DIY implementation of changing the `node` version when changing directories. I ran into issues with modifying the script to also install the `node` version if it wasn't already installed and jumped ship to [fnm](#fnm).
