---
title: "Fish shell"
sidebar:
  order: 2
---

The superior shell with sensible defaults.

## Installation

Add `brew` to the `$PATH`

```fish
// config.fish
fish_add_path /opt/homebrew/bin
```

[It is (by default) safe to use fish_add_path in config.fish.](https://fishshell.com/docs/current/cmds/fish_add_path.html)

Wrap `brew` with `Homebrew-file`

```fish
// config.fish
if test -f (brew --prefix)/etc/brew-wrap.fish
  source (brew --prefix)/etc/brew-wrap.fish
end
```
