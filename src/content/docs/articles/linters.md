---
title: 'Awesome linters'
lastUpdated: 2024-07-23
---

## knip

[knip](https://knip.dev/overview/getting-started) helps you detect unused code so that you can keep your codebases nice and clean.

## ls-lint

[ls-lint](https://ls-lint.org/) is a fast linter for file and folder names with a simple config.

## Dependency cruiser

[Dependency cruiser](https://github.com/sverweij/dependency-cruiser) is useful for ensuring that files are only importing from modules that they should be importing from. See [this note](https://github.com/Sairyss/domain-driven-hexagon?tab=readme-ov-file#enforcing-architecture) about how it can be used to enforce code architecture.

## biome

[Biome](https://biomejs.dev/guides/getting-started/) is a fast and simple formatter and linter.

### Config

```json
{
  "$schema": "https://biomejs.dev/schemas/1.8.3/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedImports": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  },
  "files": {
    "ignore": [".astro/**/*", "**/*/manifest.json"]
  }
}
```
