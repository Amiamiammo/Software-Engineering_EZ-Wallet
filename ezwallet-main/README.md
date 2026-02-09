# EZWallet

EZWallet is a full-stack web application designed to help individuals and families keep track of their expenses. Users can register, log in, create categories, record transactions, and organize shared expenses through groups — making it easy to see where money is going and make informed financial decisions.

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| **Backend**    | Node.js (v14), Express.js          |
| **Database**   | MongoDB (v4.4), Mongoose            |
| **Auth**       | JWT (access + refresh tokens), bcryptjs |
| **Testing**    | Jest, Supertest                     |
| **CI/CD**      | GitLab CI                           |
| **Containers** | Docker, Docker Compose              |

## Project Structure

```
ezwallet-main/
├── code/                        # Application source code
│   ├── controllers/             # Business logic
│   │   ├── auth.js              #   Registration, login, logout
│   │   ├── controller.js        #   Transactions & categories CRUD
│   │   ├── users.js             #   Users & groups management
│   │   └── utils.js             #   Auth verification, date/amount filters
│   ├── models/                  # Mongoose schemas
│   │   ├── model.js             #   Categories & Transactions
│   │   └── User.js              #   Users & Groups
│   ├── routes/route.js          # API endpoint definitions
│   ├── db/connection.js         # MongoDB connection setup
│   ├── test/                    # Unit & integration tests
│   ├── test_official/           # Official validation test suite
│   ├── app.js                   # Express app configuration
│   ├── server.js                # Server entry point
│   ├── docker-compose.yml       # Docker multi-container setup
│   └── package.json             # Dependencies & scripts
│
├── API.md                       # Full API specification
├── RequirementsDocumentV2.md    # Detailed requirements
├── GUIPrototypeV2.md            # UI mockups
├── TestReport.md                # Test coverage report
├── EstimationV2.md              # Project estimations
└── .gitlab-ci.yml               # CI/CD pipeline
```

## Getting Started

### Prerequisites

- **Node.js** v14+
- **MongoDB** running locally on port 27017 (or use Docker)

### Local Setup

```bash
cd code
npm install
npm start        # Starts the server on http://localhost:3000
```

Create a `.env` file inside `code/` (if not present):

```
MONGO_URI=mongodb://127.0.0.1:27017
ACCESS_KEY=EZWALLET
```

### Docker Setup

```bash
cd code
docker compose build
docker compose -p ezwallet up
```

This starts three containers:

| Container          | Description                     | Port  |
|--------------------|---------------------------------|-------|
| `ezwallet-app-1`  | Node.js application             | 3000  |
| `ezwallet-db-1`   | MongoDB database                | 27017 |
| `ezwallet-test-1` | Runs test suite and exits       | —     |

> Make sure ports 3000 and 27017 are free before starting.

## API Overview

All responses follow the format:

```json
{
  "data": "...",
  "message": "optional message"
}
```

### Authentication

| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| POST   | `/api/register`  | Register a user      |
| POST   | `/api/admin`     | Register an admin    |
| POST   | `/api/login`     | Login (sets cookies) |
| GET    | `/api/logout`    | Logout               |

### Categories (Admin only for write operations)

| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | `/api/categories`         | List all categories   |
| POST   | `/api/categories`         | Create a category     |
| PATCH  | `/api/categories/:type`   | Update a category     |
| DELETE | `/api/categories`         | Delete categories     |

### Transactions

| Method | Endpoint                                          | Description                      |
|--------|---------------------------------------------------|----------------------------------|
| POST   | `/api/users/:username/transactions`               | Create a transaction             |
| GET    | `/api/users/:username/transactions`               | Get user transactions (filterable) |
| DELETE | `/api/users/:username/transactions`               | Delete a transaction             |
| GET    | `/api/users/:username/transactions/category/:cat` | Filter by category               |
| GET    | `/api/transactions`                               | All transactions (Admin)         |

**Query filters** (on user transaction endpoints): `date`, `from`, `upTo`, `min`, `max`

### Groups

| Method | Endpoint                                         | Description                   |
|--------|--------------------------------------------------|-------------------------------|
| POST   | `/api/groups`                                    | Create a group                |
| GET    | `/api/groups/:name`                              | Get group details             |
| PATCH  | `/api/groups/:name/add`                          | Add members                   |
| PATCH  | `/api/groups/:name/remove`                       | Remove members                |
| GET    | `/api/groups/:name/transactions`                 | Group transactions            |
| GET    | `/api/groups/:name/transactions/category/:cat`   | Group transactions by category|

> See [API.md](API.md) for the complete endpoint specification.

## Authentication Model

EZWallet uses a dual JWT token system:

- **Access Token** — short-lived, used for request authorization
- **Refresh Token** — long-lived, used to renew the access token

Both tokens are stored as HTTP cookies and validated on every protected request. The system supports four authorization modes:

| Mode     | Description                                      |
|----------|--------------------------------------------------|
| Simple   | Any authenticated user                           |
| User     | Token username must match the route parameter    |
| Admin    | Token role must be `"Admin"`                     |
| Group    | Token email must belong to the specified group   |

## Testing

```bash
cd code

npm test                  # Run all tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:coverage     # All tests with coverage report
```

Coverage reports are generated as HTML in `code/coverage/`:

```
coverage/
├── lcov_report/           # Full coverage
├── coverage_unit/         # Unit test coverage
└── coverage_integration/  # Integration test coverage
```

Open the `index.html` in any of these folders to view the detailed report.

## CI/CD

The GitLab CI pipeline (`.gitlab-ci.yml`) runs the official test suite on every push to `main` or `testdelivery`:

```yaml
test:
  stage: test
  image: node:14
  services:
    - mongo:4.4
  script:
    - cd code && npm install
    - npm run test:official
```

## Documentation

| Document                        | Description                        |
|---------------------------------|------------------------------------|
| [API.md](API.md)                | Complete API specification         |
| [RequirementsDocumentV2.md](RequirementsDocumentV2.md) | Functional requirements |
| [GUIPrototypeV2.md](GUIPrototypeV2.md) | UI wireframes and mockups  |
| [TestReport.md](TestReport.md)  | Test results and coverage analysis |
| [EstimationV2.md](EstimationV2.md) | Effort and time estimation      |

## License

This project was developed as part of a Software Engineering university course.
