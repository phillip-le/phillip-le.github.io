---
title: 'Package manager for macOS'
sidebar:
  order: 1
lastUpdated: 2025-06-12
---

## Brew

Use [brew](https://brew.sh/) to install almost everything on macOS. This also handles installing XCode Command Line Tools which lets you use the `git` which was bundled with the OS (e.g. shouldn't need to [accept XCode license manually](https://stackoverflow.com/questions/25970043/git-and-xcode-why-do-i-have-to-agree-to-xcodes-tcs-to-use-git)).

### Installation

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

:::caution
Follow the instructions at the end of the script installation! The following is just an example, **don't blindly copy and paste it**!

```sh
(echo; echo 'eval "\$(${HOMEBREW_PREFIX}/bin/brew shellenv)"') >> ${shell_rcfile}
eval "\$(${HOMEBREW_PREFIX}/bin/brew shellenv)"
```

:::

Check that it worked

```sh
brew doctor
```

### Useful commands

Show what you have installed at a top level and excludes their dependencies.

```sh
brew leaves
```

You can also view your installed casks

```sh
brew list --cask
```

### Brewfile

Easily re-install all of the packages you've installed with `brew` on another machine using a [Brewfile](https://docs.brew.sh/Brew-Bundle-and-Brewfile).

Export your installed dependencies to a `Brewfile` in the current directory

```sh
brew bundle dump
```

Install your dependencies using an existing `Brewfile`

```sh
brew bundle install
```

You can overwrite an existing `Brewfile` by running the following command. This is useful when you already version your `Brewfile` using `git`.

```sh
brew bundle dump --force
```

## Devbox

### Installation

Install `devbox`

```sh
curl -fsSL https://get.jetify.com/devbox | bash
```

Add the init hook.

```fish
// ~/.config/fish/config.fish
devbox global shellenv --init-hook | source
```

Restart the terminal. This should initiate installing `nix`.

### Usage

Pull the global config:

```sh
devbox global pull git@github.com:phillip-le/devbox-config.git
```

Push the global config:

```sh
devbox global push git@github.com:phillip-le/devbox-config.git
```
