---
title: 'Handling multiple promises'
---

## TLDR

- Use [for await...of](/articles/promises/#for-awaitof) for paginated or ordered promises
- Use [Promise.allSettled()](/articles/promises/#promiseallsettled) for unordered promises where we need to know the response of each promise. Useful for error handling and observability

## `for await...of`

Useful for handling promises that are dependent on one another and should be done sequentially e.g. handling a paginated response from an API.

For example, AWS SDK v3 provides async generator functions which handle retrieving the next page of a paginated response. We could get all the users based on a `QueryCommand` as follows:

```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, paginateQuery } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient();
const dynamoDbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);

const paginator = paginateQuery(
  {
    client: dynamoDbDocumentClient,
    pageSize: 25,
  },
  {
    TableName: 'some-table',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': '12345',
    },
  },
);

const users = [];
for await (const page of paginator) {
  users.push(...(page.Items ?? []));
}
```

### Error handling

If it's possible for the async iterator to return an error where do we need to handle the error?

Placing the `try...catch` block inside of the `for await...of` loop will not work because the promise is getting `awaited` outside of the loop.

```diff lang="ts"
async function* getNumbers() {
  yield 1;
  yield Promise.reject(new Error("Something went wrong"));
}

(async function () {
  for await (const num of getNumbers()) {
-    try {
      console.log(num);
-    } catch (error) {
-      console.error(error);
-    }
  }
})();
```

[Playground Link](https://www.typescriptlang.org/play?target=99#code/IYZwngdgxgBAZgV2gFwJYHsICoYHMCmyAcggLYBG+ATiABQCUMA3gFAwxir4A2AJjAEYA3Gw5c+MAApV0pVCHwA6KvgBW+KMloR8AdxgBRKjKq0ARAGVZhABaoIuGLvwRkTmQ7P16IgL4sWWlBIWEQUDAgYBmZROHQqGGBdYFQ3WihMEDcIMhh0ODxCEgpqOm8Y9nZkKjAKyvYMiBB0biVudFxtMh9Rdl8YKGBkKBso6hNGVnqGzJalcfjaBaoe+v8+ll96BhEgA)

Instead, we want to wrap the entire `for await...of` loop inside of a `try...catch` block.

```diff lang="ts"
async function* getNumbers() {
  yield 1;
  yield Promise.reject(new Error("Something went wrong"));
}

(async function () {
+  try {
    for await (const num of getNumbers()) {
      console.log(num);
    }
+  } catch (error) {
+    console.error(error);
+  }
})();
```

[Playground Link](https://www.typescriptlang.org/play?target=99#code/IYZwngdgxgBAZgV2gFwJYHsICoYHMCmyAcggLYBG+ATiABQCUMA3gFAwxir4A2AJjAEYA3Gw5c+MAApV0pVCHwA6KvgBW+KMloR8AdxgBRKjKq0ARAGVZhABaoIuGLvwRkTmQ7P16IgL4sWWlBIWEQUDAgYBmZRZCowGPZ2OHQqGGBdYFQ3WihMEDcIMhh0ODxCEgpqOm9EpPY8iBB0biVudFxtMh9Rdn8+mChgZCgbKOoTRlZ6xubWxQnU2kWqHr6WX3oGESA)

## `Promise.all()`

When we want to resolve multiple promises which are **not** dependent on each other, we can use `Promise.all()`. `Promise.all()` will be much faster than using `for await...of` because it does not wait for each promise to resolve before firing off the next request which returns a promise.

For example, the following code snippet will resolve the same list of promises. When using `for await...of`, we wait for each execution of `someAsyncFunction` to finish before attempting to execute the next iteration. This means that it takes `10` seconds for the `for await...of` loop to finish resolving. On the other hand, when using `Promise.all()` it only takes `4` seconds to finish resolving all of the promises which is the time it takes to resolve the longest execution of `someAsyncFunction`.

```ts
const sleep = (s: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, s * 1000);
  });
};

const someAsyncFunction = async (t: number) => {
  await sleep(t);
  return t;
};

const timeInSecondsArray = [1, 2, 3, 4];

(async () => {
  const now = Date.now();
  for (const timeInSeconds of timeInSecondsArray) {
    await someAsyncFunction(timeInSeconds);
    console.log('Sequentially', timeInSeconds);
  }
  console.log('time sequentially: ', (Date.now() - now) / 1000);
})();

(async () => {
  const now = Date.now();
  const promises = timeInSecondsArray.map(async (timeInSeconds) => {
    await someAsyncFunction(timeInSeconds);
    console.log('In parallel', timeInSeconds);
  });
  await Promise.all(promises);
  console.log('time in parallel: ', (Date.now() - now) / 1000);
})();
```

[Playground Link](https://www.typescriptlang.org/play?#code/MYewdgzgLgBBA2BTRAHGBeGAKCAuGYArgLYBGiATgJQYB8MA3gFAwwWJSEVgGIDuMAAoUQxAJYREWdhBDwAbojqMWrOBwAqY4ohCEo0xLIWIANHBgAqGAEYADA6oBuVQF9nTV0yahIsWToAghAAnmDAAGKE4VBi4BgwAIah4dhQ+ERklDTo9MysiXyJYv5IqFhQHqzsnNwwUC5ePuDQ9dqIAJJgAMqIvgAmEIEUFIkhCQDaNuYATOYAzOYALAC6LkxYyWHA2Dl5qr6tYCACmAAiiVCIAHTHfFhVMABmIBTYh7CxOl29AxAwICebW+PT64EGw1GIRo+TUhWK-lEiGC2yiMTiYAq7R+YLAgyoqlYhzkN3gIAA5lgAOS9ACOhEQYFiiXg8BCVPMX06oL+jy8RJaJOuZMpACIuep6YzmayQvhReYsBcrrcTg8YABaAgnGgAelsDjsHncD3WmxSO3VuRUAr82tOMGVNzupoOLVgKBE4kk-0wXJxf0hY2uxESKHN2zS2J54IgextcKKJTgSJR4TRwFi4CxIN+sYJahgxKQwop1K6MBQiVGrMQ8A5wO5ebxcZcrHcqnhyeEogkNxZ8Cwnt7PoLRcFJZFWHF7RgYh4VZrSHg8sVTtV9xoWrueoNjkaVFNQA)

## `Promise.allSettled()`

`Promise.allSettled()` operates in a similar way to `Promise.all()` but it will catch any errors caused by rejected promises and return an error of success and fail states for each promise. On the other hand, `Promise.all()` will reject as soon as the first promise in its array rejects.

`Promise.allSettled()` is very useful for error handling and observability because usually, you want to log errors with the most context possible. For example, we place the `try...catch` block inside of the `async` map function which creates `User` records in DynamoDB so that we can log the error for each individual DynamoDB `PutItem` request.

```ts
const createUsers = async ({
  userIds,
  dynamoDbDocumentClient,
  logger,
}: {
  userIds: string[];
  dynamoDbDocumentClient: DynamoDBDocumentClient;
  logger: pino.Logger;
}) => {
  const createUserPromises = userIds.map(async (userId) => {
    try {
      await dynamoDbDocumentClient.send(
        new PutCommand({
          TableName: 'some-table',
          Item: {
            userId,
          },
        }),
      );
    } catch (error) {
      logger.error({ error }, 'Failed to create users');
      throw error;
    }
  });

  const createUserResults = await Promise.allSettled(createUserPromises);

  if (createUserResults.some((result) => status === 'rejected')) {
    throw new Error('Failed to create some users');
  }
};
```

```ts
const createUsers = async ({
  userIds,
  dynamoDbDocumentClient,
  logger,
}: {
  userIds: string[];
  dynamoDbDocumentClient: DynamoDBDocumentClient;
  logger: pino.Logger;
}) => {
  const createUserPromises = userIds.map(async (userId) => {
    try {
      await dynamoDbDocumentClient.send(
        new PutCommand({
          TableName: 'some-table',
          Item: {
            userId,
          },
        }),
      );
    } catch (error) {
      logger.error({ error }, 'Failed to create users');
      throw error;
    }
  });

  const createUserResults = await Promise.all(createUserPromises);

  if (createUserResults.some((result) => status === 'rejected')) {
    throw new Error('Failed to create some users');
  }
};
```

If we used, `Promise.all()` instead of `Promise.allSettled()`, then `createUsers` would **only** log an error for the first DynamoDB `PutItem` request that failed.

## Resource Links

- [for await...of MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)
- [Async Iterators with AWS SDK v3](https://aws.amazon.com/blogs/developer/pagination-using-async-iterators-in-modular-aws-sdk-for-javascript/)
- [Promise.all() MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [Promise.allSettled() MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
