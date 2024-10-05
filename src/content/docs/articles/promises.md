---
title: 'Handling multiple promises'
lastUpdated: 2024-10-16
---

This article will cover the different ways to handle multiple promises in TypeScript and when you might use each approach. We
will mostly be looking at retrieving a list of posts from an external Rest API. Suppose we want to fetch some posts from [JSONPlaceholder](https://jsonplaceholder.typicode.com/) using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

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

Firstly, let's look at how we would retrieve the posts by executing our requests sequentially.

## Sequential Execution / Promise sequencing

### `.forEach`

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

Secondly, even if we did have posts in the `posts` array, you will notice that the order of the requests when they are sent and the order in which the requests finish are different. This would mean that the order of our `posts` array would be different each time!

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

### Do you need to run promises sequentially?

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

We can see that it takes about `0.3` seconds to fetch all of the posts sequentially. This is the sum of all of the request times.

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

[Playground Link](https://www.typescriptlang.org/play/?moduleResolution=99&target=9&jsx=0&module=7#code/C4TwDgpgBACg9gZ2FAvFA3gKClAlgEwC4oA7AVwFsAjCAJwG5sphdgAbCYpW3Egc0YBfRpgDGcEkigAzCMFEALeFLQBDBCBKioACjCJgASSKlKNWgEpiMWnAq4EEADzLgAPlQesOcZLgcAOjY4Ph0AAwAxOUVePih9KQASdASjfEEwi0YfCSlaCAR9SWg1AHdVVhlohR0mHDCFYGAwBEIAejaAKwQJMDZVUQgFf3w6ANAwXHFRgPEKNtSENuTU4wyAGiYspl8paTI2NldUKFVyyvzC3IgA7okdbZy-QODQyOqIfHiDKBWDNcy2Sg+WAZFoJAwdTwJn2h1cAQImxwOBY7E4MgORwM41YHCRUGEmEJmB06k02genkhTykLAoEAAcnBSicACKqYA3EjMh4iGnIVb4BAnADaAEZ1lAAEySgDMAF0drlkLJ5EoDDY7A4CidBQgAhRVGAdHp-vgLFTVYpXKakMYLI8oLsBQZhWUKshNfZHAFVIcdFb1UgvdqEI6lc8bq8dAAiVwIGOSxaO3b+KMhcIAUQAHhBRGROV9eL90Dp2ZyAtzSpSALTMXD0pmlC1tKBigAMncECEBRIsvMwQA)

### Error handling and observability

What happens if one of the promises fails?

`Promise.all()` will reject as soon as one of the promises rejects. So, if we have multiple promises that
reject, we will only get the error from the first rejected promise.

```ts {7-10}
try {
  const posts = await Promise.all([
    fetchPostThatWillResolve({
      postId: 1,
      timeOutInSeconds: 1,
    }),
    fetchPostThatWillReject({
      postId: 2,
      timeOutInSeconds: 0.5,
    }),
    fetchPostThatWillReject({
      postId: 3,
      timeOutInSeconds: 2,
    }),
  ]);
  console.log('Posts', posts);
} catch (error) {
  console.error('Failed to posts', error);
}
```

So, in this case, we will only get the error from `postId: 2` because it is the first promise that rejects.

```sh
[ERR]: "Failed to posts",  Not found
```

[Playground Link](https://www.typescriptlang.org/play/?moduleResolution=99&target=9&jsx=0&module=7#code/MYewdgzgLgBBA2BTRAHASoiJ4DdEwF4YAKKASwFtEB5AVygEkwBlRUMAEwgC4YxaKAI0QAnAJSEAfDADeAKBgwRiKLRFg+iAO4wACiJAUyERMWLKsuRBILT5ixSagAVSohD1zmbHgA0Mcio6RhY2cC4YACoYAEYABgSxAG4FGABfZLk0lLl2aBgAMxVgAAtdEGhnEoBDKAB1Mnh4DEs8QhhqiABPMGASexgUCsYOX1TAmnomVnYuMbTeAaHoBg5efiFRFMUJ4Omwzh4+AWERFIypWVTqrWqyWARkdG8rUjc90NmITMVlVXUrg5BsNVmNFNksjk8rAilBSuVKjV6o1mogAFZsWBETo9PrEAa7KafcIQeaLVLLEbrE5bcbvIkzEnUzZnLI2OzXW73OBIVAtHymQkhRmHH4BEoGHRgbQwACiIgMImIAAMAHIgGEeTjKzIQuTEHG9EjswEBERdU2KaHA6AQdo3O6wfSGYyIAB01SaxAA2qkgbD4cMqrUGk1+a8BkDFJTVrwYmCozt6cKDlw4wmgRkMw4A2Ug0jQ6iMcAoPi-VGY2sYAAmbNAoX7L68OJugCsdfSYg7uYRLgLKIwxdLkYrIKrAGYO0mggzU0da+XwV3ywBdMVW8CWd3wEAAc2IACJexAD-5Kd9tukYMBaqUSKJFRIR3lsO6HyAlQeAGJ3JAcAIgDaUAnv477iJeaRssQmRAA)

But, you'll see that unfortunately our error log isn't very helpful. We don't know which post failed. Rather than wrapping
the entire `Promise.all()` call in a `try...catch` block, we can wrap each individual promise in a `try...catch` block so that
if they fail, we can have more context about which post failed.

```diff lang="ts"
const fetchPostThatWillReject = async ({
  postId,
  timeOutInSeconds,
}: {
  postId: number;
  timeOutInSeconds: number;
}) => {
+  try {
    await sleepResolve(timeOutInSeconds);
    throw new Error(`Not found`);
+  } catch (error) {
+    console.error(`Failed to retrieve post ${postId}`, error);
+    throw error;
+  }
};
```

[Playground Link](https://www.typescriptlang.org/play/?moduleResolution=99&target=9&jsx=0&module=7#code/MYewdgzgLgBBA2BTRAHASoiJ4DdEwF4YAKKASwFtEB5AVygEkwBlRUMAEwgC4YxaKAI0QAnAJSEAfDADeAKBgwRiKLRFg+iAO4wACiJAUyERMWLKsuRBILT5ixSagAVSohD1zmbHgA0Mcio6RhY2cC4YACoYAEYABgSxAG4FGABfZLk0lLl2aBgAMxVgAAtdEGhnEoBDKAB1Mnh4DEs8QhhqiABPMGASexgUCsYOX1TAmnomVnYuMbTeAaHoBg5efiFRFMUJ4Omwzh4+AWERFIypWVTqrWqyWARkdG8rUjc90NmITMVlVXUrg5BsNVmNFNksjk8rAilBSuVKjV6o1mogAFZsWBETo9PrEJYg0bjd5TT7hCDzRapZYjdYnLbEoKkmbkumbM5ZGx2cYiLqAhw3O4PJCoFo+Uy7ZkHLg-BxQEoGHRgbQwACiIgMImIAAMAHIgGEeTja2VpGDAWqlEiiTUSAaKPLYRAAOhtIC12oAYnckBwAiAlCoRGREG0aTAACQyGmrNLa-xu8TbOUKkA6RPJtKQuRyYg43okLn86HA6AQdqC+56AxGEzO6pNYgAbVSilh8OGVVqDSaYte9ocMbWsTBQICJJCLMOvBio-BYjnhWKZU7SJ7qIxwCg+Nbg8JvAATIudhP9l9eHFnQBWRcZRftleI7sojCb7cDxRD3gAZmP46Zk7SkcR67neqQALqyo6SDOvAIAAObEAARAiUAQEh-g0t85xiMQmRAA)

Now when we run the code, we can see that we have much more context about which post failed.

```sh
[ERR]: "Failed to retrieve post 2",  Not found
[ERR]: "Failed to retrieve post 3",  Not found
```

We also see that we got logs for `postId: 3` which fails after the request to `postId: 2` has already failed. This is
because while the `Promise.all()` call has already been rejected after the first promise has been rejected, the remaining
promises still continue to execute.

However, it is important to note you would only see the logs for all errors if the
runtime in which you are executing the code does not shut down the Node.js process after the first error. Scenarios like
running in a serverless functions or a scripts will kill the process immediately if the `Promise.all()` error is not handled
and so you cannot rely on the remaining promises to have logged out their errors.

### `Promise.allSettled()`

`Promise.allSettled()` is a variant of `Promise.all()` that will not reject. Instead, it will always resolve to an array of objects representing the outcome of each promise. This is useful if you want to more reliably observe and log the outcome of all of the promises in an array even if more than one of them reject.

```ts
const postFetchResults = await Promise.allSettled([
  fetchPostThatWillResolve({
    postId: 1,
    timeOutInSeconds: 1,
  }),
  fetchPostThatWillReject({
    postId: 2,
    timeOutInSeconds: 0.5,
  }),
  fetchPostThatWillReject({
    postId: 3,
    timeOutInSeconds: 2,
  }),
]);
const posts = postFetchResults.filter(
  (result) => result.status === 'fulfilled',
);

console.log('Posts', posts);
```

[Playground Link](https://www.typescriptlang.org/play/?moduleResolution=99&target=9&jsx=0&module=7#code/MYewdgzgLgBBA2BTRAHASoiJ4DdEwF4YAKKASwFtEB5AVygEkwBlRUMAEwgC4YxaKAI0QAnAJSEAfDADeAKBgwRiKLRFg+iAO4wACiJAUyERMWLKsuRBILT5ixSagAVSohD1zmbHgA0Mcio6RhY2cC4YACoYAEYABgSxAG4FGABfZLk0lLl2aBgAMxVgAAtdEGhnEoBDKAB1Mnh4DEs8QhhqiABPMGASexgUCsYOX1TAmnomVnYuMbTeAaHoBg5efiFRFMUJ4Omwzh4+AWERFIypWVTqrWqyWARkdG8rUjc90NmITMVlVXUrg5BsNVmNFNksjk8rAilBSuVKjV6o1mogAFZsWBETo9PrEJYg0bjd5TT7hCDzRapZYjdYnLbEoKkmbkumbM5ZGx2cYiLqAhw3O4PJCoFo+Uy7ZkHLg-BxQEoGHRgbQwACiIgMImIAAMAHIgGEeTja2VpGDAWqlEiiTUSAaKPLYRAAOhtIC12oAYnckBwAiAlCoRGREG0aTAACQyGmrNLa-xu8TbOUKkA6RPJtKQuRyYg43okLn86HA6Ce4olFq0eBQCDtQX3PQGIwmZ3VJqsKBQX3EADaqUUsPhwyqtQaTTFr3tDhja1iYKBARJIRZh14MQX4LEm8KFYRLiR49RGOAUHxA5nhN4ACYdztl-svrw4s6AKw7jI7odlEeHlEYE8z2nRRZ14ABmO8lyZFdpSOW8L0-VIAF1ZRLGk6yIGlyzhStMGrWtnQKRooFEMwLHwotyJrZ1oFqWgMIIIgACICmrIimkQDgmLEHMHXASwXXgEAAHNiCY-cICY-x0MyDJiEyIA)

If we look at the logs, we can see that we get logs for all of the promises that were rejected and we still receive
the posts that were successfully fetched.

```sh
[ERR]: "Failed to retrieve post 2",  Not found
[ERR]: "Failed to retrieve post 3",  Not found
[LOG]: "Posts",  [{
  "status": "fulfilled",
  "value": {
    "postId": 1
  }
}]
```

Sometimes, you may not want to continue executing code after some of the promises have been rejected. In this case, you can
see if any of the promises have been rejected and then throw an error.

```ts
if (postFetchResults.some((result) => result.status === 'rejected')) {
  throw new Error('Failed to retrieve posts');
}
```

Unfortunately, one of the negatives of this is that we lose the stack trace for the error that was thrown in the rejected
promise. You can get around this by using the [Error.cause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) property to pass the error from the rejected promise to the
new error that we throw.

```ts
if (postFetchResults.some((result) => result.status === 'rejected')) {
  throw new Error('Failed to retrieve posts', {
    cause: postFetchResults.find((result) => result.status === 'rejected')
      ?.reason,
  });
}
```

I have chosen to use the first rejected promise's error the `cause` property but you could also map all of the errors
and pass them as an array to the `cause` property. However, this can be problematic when viewing the logs due to the excessive
amount of information. This is usually why having the `try/catch` block inside of each `fetchPost` function is better for
capturing more specific context about errors that occurred.

## Bonus

### `for await...of` for async iterators

Sometimes, we need to execute a series of promises that are dependent on one another and should be done sequentially.
For example, we may need to fetch a list of users from a paginated API. In order to retrieve the next page of users, you
need to use the results from the previous page which usually includes some kind of pagination token.

A common abstraction for handling this sequencing of dependent promises is the [async iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols).
For example, the JavaScript AWS SDK v3 provides [async generator functions](https://aws.amazon.com/blogs/developer/pagination-using-async-iterators-in-modular-aws-sdk-for-javascript/) which handle retrieving the next page of a paginated response.

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

This makes use of [for await...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)
which is specifically designed to work with async iterators.

This is notably different from the previous examples that were executed sequentially, because in this case, we need to use
the results from the previous iteration to get the next page of results.

### Error handling and observability

Where do we need to handle errors from an async iterator?

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

## Resource Links

- [for await...of MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)
- [Async Iterators with AWS SDK v3](https://aws.amazon.com/blogs/developer/pagination-using-async-iterators-in-modular-aws-sdk-for-javascript/)
- [Promise.all() MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [Promise.allSettled() MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
