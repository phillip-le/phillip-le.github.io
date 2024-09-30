---
title: Replace default exports with named exports
---

tags: #syntax, #default, #export

```grit
or {
    `export default $export` => `export { $export }`,
    `import $alias from $source` => `import { $alias } from $source` where {
        and {
          $alias <: not contains `{ $imports }`,
          $alias <: not r"\* as .*",
          $source <: r".\..*",
          $source <: not r".*json."
        }
    }
}
```

## Function declared above

```javascript
const hello = () => {
  console.log("hello");
};

export default hello;
```

```javascript
const hello = () => {
  console.log("hello");
};

export { hello };
```

## Import statements are correct

```js
import hello from "./hello";
import "aws-sdk-client-mock";
import { world } from "./world";
import * as stream from "./stream";
import me from "me";
import redeemSchema from '../../validation/redeemSchema.json';
```

```js
import { hello } from "./hello";
import "aws-sdk-client-mock";
import { world } from "./world";
import * as stream from "./stream";
import me from "me";
import redeemSchema from '../../validation/redeemSchema.json';
```

