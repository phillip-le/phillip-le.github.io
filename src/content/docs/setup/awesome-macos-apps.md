---
title: 'Awesome macOS apps'
lastUpdated: 2024-07-19
---

## Spotlight Replacement

[Raycast](https://www.raycast.com/) is a better Spotlight search. It can also be used to [uninstall applications](https://youtu.be/tVDnl0YW9hA) and search for screenshots!

### Extensions

- [Clipboard History](https://www.raycast.com/extensions/clipboard-history) - Never go back to copy something twice again just because you overwrote your clipboard.
- [Git Repos](https://www.raycast.com/moored/git-repos) - Quickly access your local git repositories and open them in your favorite editor or any app.
- [Port Manager](https://www.raycast.com/lucaschultz/port-manager) - Quickly kill processes that are taking up your ports.

## Windows Management

[Rectangle Pro](https://rectangleapp.com/pro) is the one-off payment premium version of Rectangle used for windows management. Absolutely worth it to have only one keyboard shortcut for all of my windows management needs.

### Alternatives

Just use the native Raycast [windows management extension](https://www.raycast.com/extensions/window-management).

## Terminal Emulator

[Kitty](https://sw.kovidgoyal.net/kitty/) is my terminal of choice.

```
// ~/.config/kitty/kitty.conf
tab_bar_style powerline
```

### Alternatives

1. [iTerm2](https://iterm2.com/) - Old but reliable
1. [Warp](https://www.warp.dev/) - Slow startup for new shells
1. [Alacritty](https://github.com/alacritty/alacritty) - No native support for tab panes which means using `tmux` 😔

## Browser

[Arc](https://arc.net/) is the only browser worth using. It has vertical tabs, automatically closes tabs, easy shortcuts to copy the current URL (CMD + SHIFT + C) and native support for picture in picture video play.

### Setup

Use `CMD+Shift+D` to enable the Toolbar.

## Menubar Organisation

Sometimes you don't want to see everything up in the menubar all of the time.

[Hidden Bar](https://github.com/dwarvesf/hidden) just works and lets you declutter the menu bar.

## Sane Scrolling

The page should go up when I scroll upwards and when I push downwards on the trackpad. Unfortunately, macOS does not natively support decoupling scroll direction on trackpad vs mouse.

[Scroll Reverser](https://github.com/pilotmoon/Scroll-Reverser) solves this problem.

## Stop Sleeping

Sometimes you want to prevent your machine from sleeping automatically.

[Amphetamine](https://apps.apple.com/us/app/amphetamine/id937984704) is a nifty small app that stops your machine from falling asleep by manually toggling the app or by preventing the machine from falling asleep when apps you define are in focus.

### Alternatives

Run `caffeinate` in an open terminal while you want your machine to be awake.

```sh
caffeinate
```

## Better Battery Life

[Aldente](https://github.com/AppHouseKitchen/AlDente-Charge-Limiter) helps keep your laptop battery charge maxed at a threshold you set. This is useful because I always keep my laptop plugged in all day.

## Video Player

[IINA](https://github.com/iina/iina) is the modern video player for macOS.

## Notepad

[heynote](https://heynote.com/) is a brilliant notepad for keeping code snippets and random notes. It supports syntax highlighting, easy to copy code snippets, auto-formatting and Markdown support.

## Clipboard History

Raycast has a native [Clipboard History](https://www.raycast.com/extensions/clipboard-history) extension which is phenomenal.

### Alternatives

[Maccy](https://maccy.app/)

## HTTP Client

[Bruno](https://docs.usebruno.com/introduction/getting-started) is a `git` based HTTP Client.
