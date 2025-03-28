# Wardrobe Fitter App API

[![CI pipeline](https://github.com/nwikeodigwe/fitter/actions/workflows/main.yml/badge.svg)](https://github.com/nwikeodigwe/fitter/actions/workflows/main.yml)
[![CodeQL](https://github.com/nwikeodigwe/fitter/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/nwikeodigwe/fitter/actions/workflows/github-code-scanning/codeql)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![Nodejs ](https://img.shields.io/badge/node_v20.17.0-blue.svg)
![NPM](https://img.shields.io/badge/npm-10.9.2-green.svg)

## Description

Wardrobe Fitter is a modern wardrobe management application that helps users organize, track, and style their clothing items. The application provides a RESTful API that enables users to:

- Create and manage their wardrobe items
- Organize items into collections
- Create and share style combinations
- Track favorite items and collections
- Interact with other users' styles through upvotes and comments
- Manage brands and their associated items

## Features

### User Management

- User registration and authentication
- Profile management
- Secure token-based authentication
- Token refresh mechanism

### Wardrobe Management

- Add and organize clothing items
- Categorize items by brand
- Track favorite items
- Manage item collections

### Style Management

- Create style combinations
- Share styles with the community
- Get feedback through comments
- Upvote favorite styles

### Collection Management

- Create and organize collections
- Share collections with others
- Favorite collections
- Upvote collections

## Tech Stack

- **Runtime Environment**: Node.js v20.17.0
- **Package Manager**: NPM v10.9.2
- **Framework**: Express.js
- **Database**: Prisma with PostgreSQL
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js v20.17.0 or higher
- NPM v10.9.2 or higher
- Docker and Docker Compose
- PostgreSQL database

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/nwikeodigwe/fitter.git
   cd fitter
   ```

2. Using Docker (Recommended):

   ```bash
   docker compose up --build
   ```

3. Manual Installation:
   ```bash
   npm install
   npm run dev
   ```

## API Documentation

The API documentation is available at `/docs` when the server is running. It provides detailed information about:

- Available endpoints
- Request/response formats
- Authentication requirements
- Example requests and responses

### Authentication

All endpoints except authentication require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Available Endpoints

#### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh/token` - Refresh access token

#### Users

- `GET /api/user` - Get all users
- `GET /api/user/me` - Get current user profile
- `GET /api/user/:user` - Get specific user profile
- `GET /api/user/:user/collection` - Get user's collections

#### Collections

- `GET /api/collection` - Get all collections
- `GET /api/collection/:collection` - Get specific collection
- `POST /api/collection/:collection/favorite` - Favorite a collection
- `DELETE /api/collection/:collection/unfavorite` - Unfavorite a collection
- `PUT /api/collection/:collection/upvote` - Upvote a collection
- `DELETE /api/collection/:collection/unvote` - Remove upvote from collection
- `DELETE /api/collection/:collection` - Delete a collection

#### Styles

- `GET /api/style` - Get all styles
- `GET /api/style/:style` - Get specific style
- `GET /api/style/:style/comments` - Get comments on a style
- `DELETE /api/style/:style` - Delete a style

#### Items

- `GET /api/item` - Get all items
- `GET /api/item/:item` - Get specific item
- `POST /api/item/:item/favorite` - Favorite an item
- `DELETE /api/item/:item` - Delete an item

#### Brands

- `GET /api/brand` - Get all brands

## Testing

Run the test suite using Docker:

```bash
docker compose exec -it app npm test
```

## Development

The project uses:

- ESLint for code linting
- Prettier for code formatting
- Jest for testing
- GitHub Actions for CI/CD

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Implement image upload for items
- [ ] Add social features (following users, sharing)
- [ ] Implement search and filtering
- [ ] Add analytics dashboard
- [ ] Mobile app integration
- [ ] AI-powered style recommendations

## Author

[Nwike Odigwe](https://www.linkedin.com/in/nwikeodigwe/)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
