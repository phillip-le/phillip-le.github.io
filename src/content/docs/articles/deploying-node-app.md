---
title: "Deploying a Node app with DigitalOcean and Dokku"
sidebar:
  hidden: true
---

## Resource links

- https://dokku.com/docs/getting-started/install/digitalocean/
- https://dokku.com/docs/deployment/application-deployment/
- https://okhlopkov.com/cloudflare-certificates-dokku/
- https://dokku.com/docs/getting-started/upgrading/#upgrading-using-dokku-update
  - The DigitalOcean one-click deploy app had an out-of-date version of `dokku` running. But, it included `dokku-update` so it was easy to run `dokku-update -s` to upgrade everything.
- https://dokku.com/docs/deployment/builders/builder-management/#overriding-the-auto-selected-builder
- https://dokku.com/docs/configuration/environment-variables/
- https://serverfault.com/questions/709738/access-my-server-through-ssh-with-the-domain-with-cloudflare
  - Use `dig` to figure out if CloudFlare is proxying traffic through its own servers
