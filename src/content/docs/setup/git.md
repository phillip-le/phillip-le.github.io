---
title: 'Git'
lastUpdated: 2024-07-20
---

## Config

Sensible `git` options to set.

```sh
git config --global push.autosetupremote true
git config --global core.excludeFiles ~/.gitignore
git config --global blame.ignoreRevsFile .git-blame-ignore-revs
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

## Ignore specific commits in git blame

Sometimes, you will commit large formatting changes which makes `git blame` fairly useless because almost every line will have the formatting change as its most recent commit.

With `git config blame.ignoreRevsFile .git-blame-ignore-revs`, you can create a `.git-blame-ignore-revs` file containing commit SHAs that should be ignored by `git blame` in VSCode and GitHub. GitHub [supports `.git-blame-ignore-revs`](https://docs.github.com/en/repositories/working-with-files/using-files/viewing-a-file#ignore-commits-in-the-blame-view) files natively without configuration.

```
// ~/.gitconfig
[blame]
    ignoreRevsFile = .git-blame-ignore-revs
```

Example of a `.git-blame-ignore-revs` file.

```
// .git-blame-ignore-revs
# Enforced single quotes over double quotes
7e9386274b3b969b70ae4beda1b3321812c1c512
```

## Store large files in git

`git` works best with text files and while you can version other file types with it, it is usually not advised. Instead, you can use [Git LFS](https://git-lfs.com/) to manage these larger files.

## Securing GitHub SSH Key

It is a best practice to secure your SSH keys using a passphrase but it can be annoying to enter your passphrase every time you want to push / pull from GitHub.

You can reduce the number of times you have to enter your passphrase by [adding your ssh key to the ssh-agent](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#adding-your-ssh-key-to-the-ssh-agent).
