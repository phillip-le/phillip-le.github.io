---
title: 'Package manager for macOS'
sidebar:
  order: 1
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

## Brewfile

Easily re-install all of the packages you've installed with `brew` on another machine using [Homebrew-file](https://homebrew-file.readthedocs.io/en/latest/index.html).

### Installation

```sh
brew install rcmdnk/file/brew-file
```

With an existing `Brewfile`, copy that file to `~/.config/brewfile/Brewfile` and run the following command. You may need to wrap the `brew` command as shown in the [fish installation](/setup/fish-shell).

```sh
brew file install
```
