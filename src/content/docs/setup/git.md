---
title: "Git"
---

## Config

Sensible `git` options to set.

```sh
git config --global push.autosetupremote true
git config --global core.excludeFiles ~/.gitignore
```

```
// ~/.gitignore

.idea
.DS_Store
node_modules
```

See more cool `git` options explained [here](https://jvns.ca/blog/2024/02/16/popular-git-config-options/#core-excludesfile-a-global-gitignore).

## Usage

Update my branch with the latest changes from `main`.

```sh
git fetch
git merge origin/main
```

`git switch` is the new limited version of `git checkout` see [this StackOverflow thread](https://stackoverflow.com/questions/57265785/whats-the-difference-between-git-switch-and-git-checkout-branch) for more details.

Create a branch.

```sh
git switch -c $BRANCH_NAME
```

Go back to previous branch.

```sh
git switch -
```

Force push only if your changes are the latest changes on the remote. This prevents you from overwriting someone else's changes. See [more details](https://blog.gitbutler.com/git-tips-2-new-stuff-in-git/).

```sh
git push --force-with-lease
```
