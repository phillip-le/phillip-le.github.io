---
title: 'Managing node and package manager versions'
---

## volta

Manage the `node` and package manager versions by using [volta](https://docs.volta.sh/guide/). Volta also allows you to standardise the versions of `node` and the package managers used in a repository with [volta's config](https://docs.volta.sh/guide/understanding#managing-your-project).

Great if you can enforce using `volta` across all of the codebases you work in or you can consistently rely on a default version of `node`. Not great if you need to use the version of `node` specified in a `.nvmrc` file.

### Installation

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

### Usage

Inside of a repository, you can pin the node version and package manager to use in the `package.json` file with the following commands:

```sh
volta pin node
volta pin pnpm
```

## Alternatives

### fnm

If you need to use the version of `node` specified in a `.nvmrc` or `.node-version` file, use [fnm](https://github.com/Schniz/fnm), a node version manager built in Rust. One of the key selling points is that it can change the version of `node` when you change directories.

#### Installation

Install `fnm`.

```sh
curl -fsSL https://fnm.vercel.app/install | bash
```

Add the `--use-on-cd` option to the `fnm` startup script in your `config.fish` file to change `node` version when you change directories.

```sh "--use-on-cd"
// ~/.config/fish/config.fish
fnm env --use-on-cd | source
```

Add fish auto complete.

```sh
touch ~/.config/fish/completions/fnm.fish
fnm completions --shell fish > ~/.config/fish/completions/fnm.fish
```

Restart your terminal.

Then, you can install your preferred package managers with `brew`:

```sh
brew install pnpm
brew install yarn
```

### mise

[mise](https://mise.jdx.dev/) is a new up and coming "everything" version manager? See [this nice breakdown](https://ricostacruz.com/posts/mise-vs-volta) on the differences between `mise` and `volta`.

`mise` also [supports using asdf plugins](https://mise.jdx.dev/plugins.html#plugins) and so, it could be easy to install [ni](https://phillip-le.github.io/setup/running-js-package-manager-commands/).

### nvm.fish

[nvm.fish](https://github.com/jorgebucaran/nvm.fish) is another performant node version manager written in Fish that respects `.nvmrc` and `.node-version` files. Unfortunately, it does not have native support for changing the `node` version when changing directories.

Take a look at [this comment](https://github.com/jorgebucaran/nvm.fish/pull/186#issuecomment-1142412874) to see a DIY implementation of changing the `node` version when changing directories. I ran into issues with modifying the script to also install the `node` version if it wasn't already installed and jumped ship to [fnm](#fnm).
