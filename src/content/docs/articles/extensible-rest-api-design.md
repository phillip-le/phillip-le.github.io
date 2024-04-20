---
title: 'Tips for extensible Rest API design'
lastUpdated: 2024-04-20
---

Deciding the right design for a Rest API can be difficult. Here are a few tips I've found that can make it easier to avoid breaking changes for your API consumers.

### Prefer returning an array of data within an object

Suppose we have an endpoint that returns a list of users. The simplest API design would be to return the list of users directly.

```json
["1", "2"]
```

One of the disadvantages of this approach is if we want to return some kind of metadata for the response. For example, the API might not be able to return all the users in a single response so the response is paginated with a page and a token to retrieve the next page.

```json
{
  "data": ["1", "2"],
  "metadata": {
    "page": 1,
    "nextToken": "2"
  }
}
```

So, it is usually a good idea to return your list of objects inside of an object.

```json
{
  "data": ["1", "2"]
}
```

### Prefer putting data objects in an object even if it's only one property

Suppose in our response we initially only want to return a list of IDs.

```json
{
  "data": ["1", "2"]
}
```

What happens when we want to return more than just the ID? Suppose we now have a `name` property that we want to expose.

```json
{
  "data": [
    {
      "id": "1",
      "name": "John"
    },
    {
      "id": "2",
      "name": "Jane"
    }
  ]
}
```

This results in a breaking change because the shape of user object has changed from `string` to `{ id: string; name: string }`.

So, rather than returning the ID directly, it is usually a good idea to return each user as an object even if it only has a single property.

```json
{
  "data": [
    {
      "id": "1"
    },
    {
      "id": "2"
    }
  ]
}
```

### Prefer using an array over object keys when the number of items is more likely subject to change

Suppose we are trying to represent the feature flags our system has access to. We can represent this as either an `array` or as an object.

```ts
type FeatureFlags = Array<{
  name: string;
  countriesAvailable: string[];
}>;

const featureFlags: FeatureFlags = [
  {
    name: 'canSetIceCreamPreferances',
    countriesAvailable: ['Australia'],
  },
  {
    name: 'canSetHomeTown',
    countriesAvailable: ['Australia', 'Canada'],
  },
];
```

```ts
type IndividualFeatureFlagConfig = {
  countriesAvailable: string;
};

type FeatureFlags = Record<
  'canSetIceCreamPreferances' | 'canSetHomeTown',
  IndividualFeatureFlagConfig
>;

const featureFlags = {
  canSetIceCreamPreferances: {
    countriesAvailable: ['Australia'],
  },
  canSetHomeTown: {
    countriesAvailable: ['Australia', 'Canada'],
  },
};
```

For data like feature flags which changes quite often it can be good to keep to use an array because each item in the array is implicitly optional. Consumers must always search the array for the feature flag they are looking for and are required to handle what happens when they cannot find it. This means that we can remove feature flags from the API without causing brekaing changes for our consumers.

### Prefer using string unions over boolean

Suppose there are two kinds of users in our system. Admins and regular users. To differentiate between admins and regular users we could expose a `isAdmin` field on our user object.

```ts
type User = {
  id: string;
  isAdmin: boolean;
};
```

What happens when we want to introduce a new type of user? For example, a new premium tier user with extra privileges. To evolve our API without breaking changes we could add another `isPremium` property.

```ts
type User = {
  id: string;
  isAdmin: boolean;
  isPremium: boolean;
};
```

However, maybe a user can only be either an admin, premium or regular user. It can be confusing to API consumers because our type suggests that there COULD be a user that is both an admin and a premium user even though we know that should never happen.

```diff lang="json"
{
  "id": "1",
-  "isAdmin": true,
-  "isPremium": true
}
```

Having the type of user as a string union or enum from the start would allow us to easily add more types of users in the future.

```ts
type User = {
  id: string;
  type: 'ADMIN' | 'REGULAR';
};
```

### Using an array of traits over a string union

Another interesting idea to consider is how we could handle the scenario where the types of users is more likely to be subject to change quite frequently. Based on our learnings about using arrays over objects, we could represent user types as a list of privileges that the user has access to. This means that downstream API consumers are not tightly coupled to the specific type of a user and instead handle what should happen if any user has a certain privilege instead.

```ts
type User = {
  id: string;
  privileges: string[];
};
```

So now, downstream consumers would change:

```diff lang="ts"
-if (user.type !== "ADMIN") {
+if (user.privileges.includes("DELETE_GROUP")) {
  throw new UnauthorizedError()
}
```

So, the types of users can change without breaking downstream consumers. For example, we could remove the concept of an `ADMIN` user.

### Useful links

If you are interested in understanding what constitutes a breaking change or how to handle breaking changes, [Breaking Changes in APIs](https://betterprogramming.pub/breaking-changes-in-apis-bf45ddfedba0) is a great article that goes through that in detail.
