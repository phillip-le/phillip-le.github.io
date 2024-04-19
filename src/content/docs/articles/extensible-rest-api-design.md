---
title: "Tips for extensible Rest API design"
lastUpdated: 2024-04-19
---

Deciding the right design for a Rest API can be difficult. Here are a few tips I've found that can make it easier to avoid breaking changes for your API consumers.

### Return array of data within an object

Suppose we have an endpoint that returns a list of users. The simplest API design would be to return the list of users directly.

```json
[
  {
    "id": "1",
    "name": "Jane"
  },
  {
    "id": "2",
    "name": "John"
  }
]
```

One of the disadvantages of this approach is if we want to return some kind of metadata for the response. For example, the API might not be able to return all the users in a single response so the response is paginated with a page and a token to retrieve the next page.

```json
{
  "data": [
    {
      "id": "1",
      "name": "Jane"
    },
    {
      "id": "2",
      "name": "John"
    }
  ]
}
```

### Prefer putting inside of a key

```json
{
  "data": ["Australia", "Canada"]
}
```

```json
{
  "data": [
    {
      "name": "Australia"
    },
    {
      "name": "Canada"
    }
  ]
}
```

```json
{
  "data": [
    {
      "name": "Australia",
      "favouriteFood": "Chicken Parma"
    },
    {
      "name": "Canada",
      "favouriteFood": "Poutine"
    }
  ]
}
```

### Use array when you aren't sure if

```json
{
  "featureFlags": {
    "profilePhoto": {},
    "personalLinks": {}
  }
}
```

```json
{
  "featureFlags": [
    {
      "name": "Profile photo"
    },
    {
      "name": "Personal links"
    }
  ]
}
```
