# wardrobe fitter app api

![Build Status](https://github.com/nwikeodigwe/fitter/actions/workflows/main.yaml/badge.svg)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[![Nodejs ](https://img.shields.io/badge/node_v20.17.0-blue.svg)](https://shields.io/)

[![NPM](https://img.shields.io/badge/npm-10.9.2-green.svg)] (https://shields.io/)

This repository contains the code for a restful api wardrope manager app. The idea is to manage daily style and track wardrop items across a period of time. Users are able to create and share style from combining different wardrop items and assign them to a collection of styles.

# Usage

You can contribute to this repository otherwise fork and extend feautures. I have also built this project into a docker container and hopely in the future turn it into a microservice.

run `docker compose up --build`

You can also run test
run `docker compose exec -it app npm test`

## Data Model

The user model contains the following fields:
| id String
| name String?
| email String
| password String
| social String?
| createdAt DateTime
| updatedAt DateTime
| brands Brand[]
| brandSubscription BrandSubscription[]
| brandVote BrandVote[]
| authoredCollections Collection[]
| collectionVote CollectionVote[]
| comments Comment[]
| commentVote CommentVote[]
| favoriteBrands FavoriteBrand[]
| favoriteCollections FavoriteCollection[]
| favoriteStyles FavoriteStyle[]
| items Item[]
| itemVote ItemVote[]
| profile Profile?
| resets Reset[]
| authoredStyles Style[]
| styleVote StyleVote[]
| subscriptions UserSubscription[]
| subscribers UserSubscription[]
| favoriteItem FavoriteItem[]

The profile model contains the following fields:
| id String  
| firstname String?
| lastname String?
| bio String?
| createdAt DateTime
| updatedAt DateTime
| userId String
| user User

The usersubscription model contains the following fields:
| id String
| userId String
| subscriberId String
| createdAt DateTime
| subscriber User
| user User

The reset model contains the following fields:
| id String
| token String
| expires DateTime
| createdAt DateTime
| updatedAt DateTime
| userId String
| user User

The tag model contains the following fields:
| id String
| name String
| createdAt DateTime
| updatedAt DateTime
| brands Brand[]
| collections Collection[]
| comments Comment[]
| items Item[]
| styles Style[]

continues....

## Author

[Nwike Odigwe](https://www.linkedin.com/in/nwikeodigwe/)

## License

Licensed under the Apache License. See [LICENSE](LICENSE)
