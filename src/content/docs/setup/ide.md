---
title: 'IDE'
lastUpdated: 2025-06-11
---

## VSCode

### Settings

```json
// settings.json
{
  "[javascript][json][jsonc][typescript][typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2,
    "editor.useTabStops": false
  },
  "editor.bracketPairColorization.enabled": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.formatOnType": true,
  "editor.fontFamily": "'Monaspace Neon', monospace"
}
```

### Extensions

[TypeScript Explorer](https://marketplace.visualstudio.com/items?itemName=mxsdev.typescript-explorer)

[Prettify TypeScript: Better Type Previews](https://marketplace.visualstudio.com/items?itemName=MylesMurphy.prettify-ts)

[Pretty TypeScript Errors](https://marketplace.visualstudio.com/items?itemName=yoavbls.pretty-ts-errors)

[Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)

[Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme)

An example of my list of installed extensions:

```
// extensions.txt
astro-build.astro-vscode
bierner.markdown-mermaid
biomejs.biome
dbaeumer.vscode-eslint
equinusocio.vsc-material-theme-icons
esbenp.prettier-vscode
github.vscode-pull-request-github
hnw.vscode-auto-open-markdown-preview
jock.svg
mrmlnc.vscode-json5
ms-azuretools.vscode-containers
ms-azuretools.vscode-docker
ms-vscode-remote.remote-containers
mxsdev.typescript-explorer
mylesmurphy.prettify-ts
pkief.material-icon-theme
richie5um2.vscode-sort-json
skyapps.fish-vscode
streetsidesoftware.code-spell-checker
unifiedjs.vscode-mdx
usernamehw.errorlens
waderyan.gitblame
wallabyjs.wallaby-vscode
wayou.vscode-todo-highlight
yoavbls.pretty-ts-errors
yzhang.markdown-all-in-one
```

### Exporting extensions

Cursor doesn't support syncing extensions from one machine to another. If you are doing a one-time migration, you can use the CLI to export your extensions:

```sh
cursor --list-extensions >> extensions.txt
```

Then, install them using:

```sh
cat extensions.txt | xargs -n 1 code --install-extension
```

## Fonts

[Monaspace](https://github.com/githubnext/monaspace)

[JetBrains Mono](https://www.jetbrains.com/lp/mono/)
