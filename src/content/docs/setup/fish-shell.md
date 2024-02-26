---
title: "Fish shell"
sidebar:
  order: 2
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

## z

[z](https://github.com/jethrokuan/z) makes changing directories a breeze by remembering the directories that you frequently visit and letting you fuzzy jump to the directory you want.

### Installation

```sh
fisher install jethrokuan/z
```

## bat

The better `cat` alternative.

### Installation

```sh
brew install bat
```

## fd

The better `find` alternative.

### Installation

```sh
brew install fd
```

## eza

The better `ls` alternative.

### Installation

```sh
brew install eza
```

## fzf

[fzf](https://github.com/junegunn/fzf) is a general-purpose command-line fuzzy finder.
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