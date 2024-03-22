---
title: "Sensible defaults for Node AWS SDK v3 clients"
---

## Setting timeouts

By default, the AWS SDK v3 clients maintains a maximum of `50` sockets and the client queues requests and assigns them to sockets as they become available. The AWS SDK v3 clients also do not enforce a request timeout by default, so requests that are left hanging can cause incoming requests to continue queuing, causing timing out for external consumers.

It is usually a good idea to set the `requestTimeout` to some sensible value so that requests that are hanging for an unusually long time can be killed and your application can continue handling additional requests.

> `requestTimeout`: The number of milliseconds a request can take before automatically being terminated. Defaults to 0, which disables the timeout.
>
> [Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-smithy-node-http-handler/Interface/NodeHttpHandlerOptions/)

For example, this can be set in the `S3Client` as follows:

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";

export const s3Client = new S3Client({
  requestHandler: new NodeHttpHandler({
    requestTimeout: 30_000,
  }),
});
```

Or more simply,

```ts
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  requestHandler: {
    requestTimeout: 30_000,
  },
});
```

## Reusing TCP connections

Setting up a new TCP connection for every request can be expensive so re-using the same TCP connection for AWS SDK v3 client requests can be useful. Fortunately, the AWS SDK v3 clients will [reuse the TCP connections by default](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-reusing-connections.html).

## Setting AWS region

If you are running your application in AWS, some environments like Fargate and Lambda expose the AWS region as the `AWS_DEFAULT_REGION` or `AWS_REGION` environmental variables. So you can initialise a client as follows:

```ts
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
});
```

## Resource Links

- [Configuring max sockets](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html)
- [Reusing connections](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-reusing-connections.html)
- [Using Lambda environmental variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)
