# Wardrobe fitter app API

[![CI pipeline](https://github.com/nwikeodigwe/fitter/actions/workflows/main.yml/badge.svg)](https://github.com/nwikeodigwe/fitter/actions/workflows/main.yml)
[![CodeQL](https://github.com/nwikeodigwe/fitter/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/nwikeodigwe/fitter/actions/workflows/github-code-scanning/codeql)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Nodejs ](https://img.shields.io/badge/node_v20.17.0-blue.svg)]
![NPM](https://img.shields.io/badge/npm-10.9.2-green.svg)

# Description

This repository contains the code for a restful API for a wardrobe manager app. The idea is to manage daily style and track wardrobe items. Users are able to create and share style from combining different wardrobe items and assign them to a collection of styles.

# Usage

You can contribute to this repository otherwise fork and extend features. I have also built this project into a docker container and hopefully in the future turn it into a microservice.

run `docker compose up --build`

You can also run test

run `docker compose exec -it app npm test`

# Data Model

**User**

| Name     | Data type |
| -------- | --------- |
| name     | String    |
| email    | String    |
| password | String    |
| social   | String    |

**Profile**

| Name      | Data type |
| --------- | --------- |
| firstname | String    |
| lastname  | String    |
| bio       | String    |

**UserSubscription**

| Name       | Data type |
| ---------- | --------- |
| user       | String    |
| subscriber | String    |

**Reset**

| Name    | Data type |
| ------- | --------- |
| token   | String    |
| expires | DateTime  |
| user    | User      |

**Tag**

| Name | Data type |
| ---- | --------- |
| name | String    |

**Brand**

| Name        | Data type |
| ----------- | --------- |
| name        | String    |
| description | String    |
| logo        | String    |
| user        | User      |

**BrandSubscription**

| Name  | Data type |
| ----- | --------- |
| brand | Brand     |
| user  | User      |

**Collection**

| Name        | Data type |
| ----------- | --------- |
| name        | String    |
| description | String    |
| user        | User      |

**Style**

| Name        | Data type |
| ----------- | --------- |
| name        | string    |
| description | String    |
| published   | Boolean   |
| user        | User      |

**Item**

| Name        | Data type |
| ----------- | --------- |
| name        | String    |
| description | String    |
| published   | Boolean   |
| brand       | Brand     |
| user        | User      |

**Logo**

| Name  | Data type |
| ----- | --------- |
| image | Image     |

**Image**

| Name | Data type |
| ---- | --------- |
| url  | string    |

**Comment**

| Name    | Data Type |
| ------- | --------- |
| content | string    |
| tags    | Tag       |
| replies | Comment   |
| user    | User      |

**FavoriteBrand**

| Name  | Data type |
| ----- | --------- |
| user  | User      |
| brand | Brand     |

**FavoriteCollection**

| Name       | Data type  |
| ---------- | ---------- |
| user       | User       |
| collection | Collection |

**FavoriteStyle**

| Name  | Data type |
| ----- | --------- |
| user  | User      |
| style | Style     |

**FavoriteItem**

| Name | Data type |
| ---- | --------- |
| user | User      |
| item | Item      |

**BrandVote**

| Name  | Data type |
| ----- | --------- |
| user  | User      |
| brand | Brand     |
| vote  | Boolean   |

**CollectionVote**

| Name       | Data type  |
| ---------- | ---------- |
| user       | User       |
| collection | Collection |
| vote       | Boolean    |

**StyleVote**

| Name  | Data type |
| ----- | --------- |
| user  | User      |
| style | Style     |
| vote  | Boolean   |

**ItemVote**

| Name | Data Type |
| ---- | --------- |
| user | User      |
| item | Item      |
| vote | Boolean   |

**CommentVote**

| Name    | Data type |
| ------- | --------- |
| user    | User      |
| comment | Comment   |
| vote    | Boolean   |

# Endpoints

**Auth**
POST api/auth/signup

POST api/auth/signin

POST api/auth/reset

POST api/auth/reset/:token

**User**
GET api/user

GET api/user/:user

GET api/user/me

PATCH api/user/me

GET api/user/profile

PATCH api/user/profile

GET api/user/style

POST api/user/subscribe

DELETE api/user/unsubscribe

PATCH api/user/password

**Collection**
POST api/collection

GET api/collection

GET api/collection/:collection

PATCH api/collection/:collection

DELETE api/collection/collection

GET api/collection/:collection/styles

POST api/collection/:collection/favorite

DELETE api/collection/:collection/unfavorite

PUT api/collection/:collection/upvote

PUT api/collection/:collection/downvote

DELETE api/collection/:collection/unvote

**Brand**

POST api/brand

GET api/brand

GET api/brand/:brand

PATCH api/brand/:brand

PUT api/brand/:brand/upvote

PUT api/brand/:brand/downvote

DELETE api/brand/:brand/unvote

POST api/brand/:brand/favorite

POST api/brand/:brand/comment

GET api/brand/:brand/comment

POST api/brand/:brand/comment/:comment

POST api/brand/:brand/subscribe

DELETE api/brand/:brand/unsubscribe

DELETE api/brand/comment/:comment

DELETE api/brand/:brand

**Style**

POST api/style

GET api/style

GET api/style/:style

GET api/style/user/:user

PATCH api/style/:style

GET api/style/:style/publish

PATCH api/style/:style/unpublish

PUT api/style/:style/upvote

PUT api/style/:style/downvote

DELETE api/style/:style/unvote

POST api/style/:style/favorite

POST api/style/:style/comment

GET api/style/:style/comment

POST api/style/:style/comment/:comment

DELETE api/style/comment/:comment

DELETE api/style/:style

**Item**

POST api/item

GET api/item

GET api/item/:item

GET api/item/user/:user

PATCH api/item/:item

PUT api/item/:item/upvote

PUT api/item/:item/downvote

DELETE api/item/:item/unvote

POST api/item/:item/favorite

DELETE POST api/item/:item

## Author

[Nwike Odigwe](https://www.linkedin.com/in/nwikeodigwe/)

## License

Licensed under the Apache License. See [LICENSE](LICENSE)
