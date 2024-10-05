---
title: 'Handling multiple promises'
lastUpdated: 2024-07-10
---

## Sequential Execution / Promise sequencing

### `.forEach`

[.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) generally should not be used with `async` functions because it has unintuitive behaviour.

For example, suppose we want to fetch some posts from [JSONPlaceholder](https://jsonplaceholder.typicode.com/) using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

```ts
type Post = {
  id: number;
  title: string;
};

const fetchPost = async (postId: number): Promise<Post> => {
  console.log(`Fetching post ${postId}`);
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${postId}`,
  );
  const fullPost = await response.json();
  console.log(`Fetched post ${postId}`);
  return {
    id: fullPost.id,
    title: fullPost.title,
  };
};
```

We might be tempted to use `.forEach` to fetch all of the posts.

```ts
const postIds = [1, 2, 3];

const posts: Post[] = [];
postIds.forEach(async (postId) => {
  const post = await fetchPost(postId);
  posts.push(post);
});
console.log('Posts', posts);
```

But, we get some unexpected results when we look at our logs:

```sh
[LOG]: "Fetching post 1"
[LOG]: "Fetching post 2"
[LOG]: "Fetching post 3"
[LOG]: "Posts",  []
[LOG]: "Fetched post 2"
[LOG]: "Fetched post 1"
[LOG]: "Fetched post 3"
```

Firstly, we don't have any posts in the `posts` array! This is because `.forEach` does not wait for promises as mentioned in the [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#description). So, right after we start firing off our requests, the `console.log('Posts', posts);` statement is executed which will always print an empty array.

Secondly, even if we did have posts in the `posts` array, you will notice that the order of the posts when they finish being
fetched is different to the order that we started fetching them in. This would mean that the order of our `posts` array
would be different each time!

[Playground Link](https://www.typescriptlang.org/play/?target=9&moduleResolution=99&module=7&jsx=0#code/C4TwDgpgBACg9gZ2FAvFA3gKClAlgEwC4oA7AVwFsAjCAJwG5sphdgAbCYpW3Egc0YBfRpgDGcEkigAzCMFEALeFLQBDBCBKioACjCJgASSKlKNWgEpiMWnAq4EEADzLgAPlQesOcZLgcAOjY4Ph0AAwAxOUVePih9KQASdASjfEEwi0YfCSlaCAR9SWg1AHdVVhlohR0mHDCFYGAwBEIAejaAKwQJMDZVUQgFf3w6ANAwXHFRgPEKNtSENuTU4wyAGiYspl8paTI2NldUKFVyyvzC3IgA7okdbZy-QODQyOqIfHiDKBWDNcy2Sg+WAZFoJAwdTwJn2h1cAQImxwOBY7E4MgORwM41YHCRUGEmEJmB06k02genkhTykq3wCBOAG0AIzrKAAJjZAGYALoiGnIRbWAyMnlMvlMOkIALSOC0ACiAxqZK0ujpFip3mRu0FPzKFWQsnkSgMen++EeyMWATAZAQNVSlsElt2-hurx0ACJXAhPWzFttnQ9GEA)

### `for...of`

The [for...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of#description) loop offers
a more intuitive way of handling promises sequentially.

```ts
const posts: Post[] = [];
for (const postId of postIds) {
  const post = await fetchPost(postId);
  posts.push(post);
}
console.log('Posts', posts);
```

This gives us the following output:

```sh
[LOG]: "Fetching post 1"
[LOG]: "Fetched post 1"
[LOG]: "Fetching post 2"
[LOG]: "Fetched post 2"
[LOG]: "Fetching post 3"
[LOG]: "Fetched post 3"
[LOG]: "Posts",  [{
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit"
}, {
  "id": 2,
  "title": "qui est esse"
}, {
  "id": 3,
  "title": "ea molestias quasi exercitationem repellat qui ipsa sit aut"
}]
```

[Playground Link](https://www.typescriptlang.org/play/?moduleResolution=99&target=9&jsx=0&module=7#code/C4TwDgpgBACg9gZ2FAvFA3gKClAlgEwC4oA7AVwFsAjCAJwG5sphdgAbCYpW3Egc0YBfRpgDGcEkigAzCMFEALeFLQBDBCBKioACjCJgASSKlKNWgEpiMWnAq4EEADzLgAPlQesOcZLgcAOjY4Ph0AAwAxOUVePih9KQASdASjfEEwi0YfCSlaCAR9SWg1AHdVVhlohR0mHDCFYGAwBEIAejaAKwQJMDZVUQgFf3w6ANAwXHFRgPEKNtSENuTU4wyAGiYspl8paTI2NldUKFVyyvzC3IgA7okdbZy-QODQyOqIfHiDKBWDNcy2Sg+WAZFoJAwdTwJn2h1cAQImxwOBY7E4MgORwM41YHCRUGEmEJmB06k02genkhTykq3wCBOAG0AIzrKAAJjZAGYALoiGnIRbWAyMnlMvlMaRwWi6XaC-5fODSb5IYwICzU5FylXIMoVZCyeRKAx6BWPZGLAJgMgIGqpc2Emn+G6vHQAIlcCDdbMW20EFgejCAA)

Now, we have a `posts` array with our expected posts in the same order that we started fetching them in.

### `.reduce()`

As described in the [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#composition), promise sequencing can also be achieved using [.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#running_promises_in_sequence).

```ts
const posts = await postIds.reduce(
  async (acc, postId) => {
    const fetchedPosts = await acc;
    const newPost = await fetchPost(postId);
    return [...fetchedPosts, newPost];
  },
  Promise.resolve([] as Post[]),
);
```

[Playground Link](https://www.typescriptlang.org/play/?target=9&moduleResolution=99&module=7&jsx=0#code/C4TwDgpgBACg9gZ2FAvFA3gKClAlgEwC4oA7AVwFsAjCAJwG5sphdgAbCYpW3Egc0YBfRpgDGcEkigAzCMFEALeFLQBDBCBKioACjCJgASSKlKNWgEpiMWnAq4EEADzLgAPlQesOcZLgcAOjY4Ph0AAwAxOUVePih9KQASdASjfEEwi0YfCSlaCAR9SWg1AHdVVhlohR0mHDCFYGAwBEIAejaAKwQJMDZVUQgFf3w6ANAwXHFRgPEKNtSENuTU4wyAGiYspl8paTI2NldUKFVyyvzC3IgA7okdbZy-QODQyOqIfHiDKBWDNcy2Sg+WAZFoJAwdTwJn2h1cAQImxwOBY7E4MgORwM41YHCRUGEmEJmB06k02genkhTykLAoEAAcnBSicACKqYA3EjMh5A3bIVb4BAnADaAEZ1lAAEySgDMAF1MDtcgKDMKyhVVUhjAgAvl8GRBrVkacNFpdANRJLBRYqd4TVB+VV5ApPq51adzshLUCTU6SBBSscNZVZC7XHp-vhHg6QWCISKAkmw4o3WrJQGgwZ5b6CficDY7A4bpd-AA3CA6EXy02wAzViz4mO7fw3V46ABE7o71rVzdyraCIXCAFEAB4QURkTlfXi-dA6dmcgLc0qUgC0zFw9KZpVtbSgYoADCfBAhAUSLLzMEA)

This is the equivalent of:

```ts
const posts = await Promise.resolve([] as Post[])
  .then(async (fetchedPosts) => {
    const newPost = await fetchPost(1);
    return [...fetchedPosts, newPost];
  })
  .then(async (fetchedPosts) => {
    const newPost = await fetchPost(2);
    return [...fetchedPosts, newPost];
  })
  .then(async (fetchedPosts) => {
    const newPost = await fetchPost(3);
    return [...fetchedPosts, newPost];
  });
```

[Playground Link](https://www.typescriptlang.org/play/?target=9&moduleResolution=99&module=7&jsx=0#code/C4TwDgpgBACg9gZ2FAvFA3gKClAlgEwC4oA7AVwFsAjCAJwG5sphdgAbCYpW3Egc0YBfRpgDGcEkigAzCMFEALeFLQBDBCBKioACjCJgASSKlKNWgEpiMWnAq4EEADzLgAPlQesOcZLgcAOjY4Ph0AAwAxOUVePih9KQASdASjfEEwi0YfCSlaCAR9SWg1AHdVVhlohR0mHDCFYGAwBEIAejaAKwQJMDZVUQgFf3w6ANAwXHFRgPEKNtSENuTU4wyAGiYspl8paTI2NldUKFVyyvzC3IgA7okdbZy-QODQyOqIfHiDKBWDNcy2Sg+WAZFoJAwdTwJn2h1cAQImxwOBY7E4MgORwM41YHCRUGEmEJmB06k02genkhTykLAoEAAcnBSicACKqYA3EjMh4iGnIRYnM4VZA2OwOG6XfwANwgOgA2gBdU4IWAGJUWKHjBQQEikjRaXSyeQ6-CuBAWKneZH80gQUrHMoiqom1w6ACMjxtwLkYIh8oCgeNik+5vWdodBkVQJwgk1Nu1uv15KNHzNBgtVqhtpI9sdp3OyGDSgMOgATF6bSC-VAA0G02GI65o1C41rgDq9WTDTpi6GM5aUF5s1Bdshc5GVAXncW3QBmSvI6vg2uBgJ99NIBDhifNmMEr27fw3V46ABE5rP4cWh9yx6CIXCAFEAB4QURkTlfXi-dA6dmcgE3KlJSAC0zC4PSTKlJabRQO6AAMSGCAggJEhYvKYEAA)

This is functionally the same as using `for...of` but done in a more functional style.

If we look at our logs again,

```sh
[LOG]: "Fetching post 1"
[LOG]: "Fetched post 1"
[LOG]: "Fetching post 2"
[LOG]: "Fetched post 2"
[LOG]: "Fetching post 3"
[LOG]: "Fetched post 3"
```

We can see that we only start fetching the next post once we have finished fetching the previous post.

If we start timing how long this takes:

```diff lang="ts"
+const timeNow = Date.now();
const postIds = [1, 2, 3]

const posts = await postIds.reduce(
  async (acc, postId) => {
    const fetchedPosts = await acc;
    const newPost = await fetchPost(postId);
    return [...fetchedPosts, newPost];
  },
  Promise.resolve([] as Post[]),
);
console.log("Posts", posts);
+console.log(`Executed in ${(Date.now() - timeNow) / 1000}s`);
```

We can see that it takes about `0.3` seconds to fetch all of the posts sequentially.

```sh
[LOG]: "Executed in 0.283s"
```

However, do we need to fetch the posts sequentially? Sometimes, we may need to fetch the posts sequentially because we do
not want to overwhelm the server with too many requests. However, since we are only fetching three posts, we can consider
fetching them in parallel.

## Parallel Execution

### `Promise.all()`

[`Promise.all()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) offers a way
of only continuing when all of the promises in the array have been resolved. If you remember when we used `.forEach()`,
the requests were actually being fired off without waiting for the previous request to complete. This is exactly the
behaviour that we want.

```ts
const fetchPostPromises = postIds.map((postId) => fetchPost(postId));
const posts = await Promise.all(fetchPostPromises);
```

Here I have used `.map()` to create an array of promises. When we use `.map()`, the requests are already being fired off in
parallel. If we did not care about the results of the requests, we could continue the execution of our function without
doing anything else. However, since we want to see the results of the requests, we use `Promise.all()` to wait for all of
the requests to complete.

Output:

```sh {5,8,11} "0.078s"
[LOG]: "Fetching post 1"
[LOG]: "Fetching post 3"
[LOG]: "Fetched post 2"
[LOG]: "Posts",  [{
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit"
}, {
  "id": 2,
  "title": "qui est esse"
}, {
  "id": 3,
  "title": "ea molestias quasi exercitationem repellat qui ipsa sit aut"
}]
[LOG]: "Executed in 0.078s"
```

You will notice that unlike with `.forEach()`, the posts _are_ in the same order that we started fetching them in. This is
because `Promise.all()` returns the results of the promises in the same order as its input array. The other thing to note
is that by executing the requests in parallel, we reduce the overall time it takes to fetch all of the posts to `0.078s`.
This is the time it takes to resolve the longest request rather than the sum of all of the request times.

## `for await...of` for async iterators

Sometimes, we need to execute a series of promises that are dependent on one another and should be done sequentially.
For example, we may need to fetch a list of users from a paginated API.

The JavaScript AWS SDK v3 provides [async generator functions](https://aws.amazon.com/blogs/developer/pagination-using-async-iterators-in-modular-aws-sdk-for-javascript/) which handle retrieving the next page of a paginated response.

We could get all the users based on a `QueryCommand` as follows:

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

This is notably different from the previous examples that were executed sequentially, because in this case, we need to use
the results from the previous iteration to get the next page of results.

### Error handling

If it is possible for the async iterator to return an error where do we need to handle the error?

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
      logger.error(
        {
          error,
        },
        'Failed to create users',
      );
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
      logger.error(
        {
          error,
        },
        'Failed to create users',
      );
      throw error;
    }
  });

  const createUserResults = await Promise.all(createUserPromises);

  if (createUserResults.some((result) => status === 'rejected')) {
    throw new Error('Failed to create some users');
  }
};
```

If we used `Promise.all()` instead of `Promise.allSettled()`, then `createUsers` would **only** log an error for the first DynamoDB `PutItem` request that failed within the context of short lived applications such as serverless functions or scripts. For long running applications like containerized Rest APIs, `Promise.all()` and `Promise.allSettled()` would function the same.

## Resource Links

- [for await...of MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)
- [Async Iterators with AWS SDK v3](https://aws.amazon.com/blogs/developer/pagination-using-async-iterators-in-modular-aws-sdk-for-javascript/)
- [Promise.all() MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [Promise.allSettled() MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
