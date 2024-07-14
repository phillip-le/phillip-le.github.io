---
title: 'Fish shell'
sidebar:
  order: 2
lastUpdated: 2024-07-09
---

[Fish](https://fishshell.com/) is the superior shell with sensible defaults.

### Installation

```sh
brew install fish
```

Find the path to the fish installation.

```sh
which fish
```

Add `fish` to known shells.

```
// /etc/shells
/opt/homebrew/bin/fish
```

Restart terminal.

Set `fish` as default shell

```sh
chsh -s /opt/homebrew/bin/fish
```

Add `brew` to the `$PATH` in your `config.fish` file.

```fish
// config.fish
fish_add_path /opt/homebrew/bin
```

[It is (by default) safe to use fish_add_path in config.fish.](https://fishshell.com/docs/current/cmds/fish_add_path.html)

Wrap `brew` with `Homebrew-file` in your `config.fish` file.

```fish
// config.fish
if test -f (brew --prefix)/etc/brew-wrap.fish
  source (brew --prefix)/etc/brew-wrap.fish
end
```

## Fisher

[Fisher](https://github.com/jorgebucaran/fisher/) is a plugin manager for `fish`.

### Installation

```sh
curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher
```

## Tide

[Tide](https://github.com/IlanCosman/tide) is a customizable prompt for `fish`.

### Installation

```sh
fisher install IlanCosman/tide@v6
```

Configure the prompt.

```sh
tide configure
```

[Install the recommended font](https://github.com/IlanCosman/tide?tab=readme-ov-file#fonts).

:::caution
Not compatible with [fnm](https://github.com/Schniz/fnm/issues/1039). Error message:

```sh
thread 'main' panicked at 'Can't write output: Os { code: 32, kind: BrokenPipe, message: "Broken pipe" }', src/commands/use.rs:93:13
```

:::

### Alternatives

[Starship](https://starship.rs/) is a cross-shell prompt that has a customizable config file. I use this when I need to use [fnm](https://github.com/Schniz/fnm) for [managing my node version](/setup/managing-node-version).

## zoxide

[zoxide](https://github.com/ajeetdsouza/zoxide) makes changing directories a breeze by remembering the directories that you frequently visit and letting you fuzzy jump to the directory you want. But honestly, I use the [Git Repos](https://www.raycast.com/moored/git-repos) [Raycast](https://www.raycast.com/) extension far more than `zoxide`.

### Installation

Install `zoxide` with brew.

```sh
brew install zoxide
```

Add `zoxide init fish | source` to the end of your `config.fish`.

```fish
// ~/.config/fish/config.fish
zoxide init fish | source
```

Some people like to change the command to run `zoxide` to `cd` using the [--cmd](https://github.com/ajeetdsouza/zoxide?tab=readme-ov-file#flags) flag. You can do this by changing the `zoxide init` command in your `config.fish` file but I found it annoying that `fish` would highlight the arguments to `cd` with red syntax highlighting.

### Alternatives

[z](https://github.com/jethrokuan/z) is a native `fish` plugin that also lets you change directories with a snippet of the actual directory's name.

#### Installation

```sh
fisher install jethrokuan/z
```

## bat

[bat](https://github.com/sharkdp/bat) is the better `cat` alternative.

### Installation

```sh
brew install bat
```

## fd

[fd](https://github.com/sharkdp/fd) is the better `find` alternative.

### Installation

```sh
brew install fd
```

## eza

[eza](https://github.com/eza-community/eza) is the better `ls` alternative.

### Installation

```sh
brew install eza
```

## fzf

[fzf](https://github.com/junegunn/fzf) is a general-purpose command-line fuzzy finder. I find this to be really useful for searching through my command history.

[fzf.fish](https://github.com/PatrickF1/fzf.fish) adds nice keybindings for `fzf`.

### Installation

Install `fzf`

```sh
brew install fzf
```

Install `fzf.fish`

```sh
fisher install PatrickF1/fzf.fish
```

### Usage

Show command history: `CTRL + R`
