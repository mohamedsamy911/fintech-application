# 💸 NestJS Fintech API

This is a **NestJS-based backend service** for a simple fintech application. It allows users to:

- ✅ Create a new account
- 💰 Deposit or withdraw money
- 📊 Check account balance
- 📝 Check account transactions history

---

## 🛠️ Features

- RESTful APIs for account and transaction management
- Input validation using `class-validator`
- Error handling with proper HTTP status codes
- Swagger documentation support
- Unit-tested services and controllers
- Docker support for easy deployment

---

## ✨ Design Considerations

### Why `pessimistic_write` was used
To ensure consistency during concurrent transactions, `pessimistic_write` locking is used when fetching an account. This prevents race conditions like two withdrawals reducing balance below zero simultaneously.

### Why DTO validation was layered
DTOs use `class-validator` decorators (e.g., `@IsUUID`, `@IsIn`, `@IsNumber`) to enforce input constraints before they reach the business logic. This centralizes validation and simplifies controller code.

### How exceptions are caught and surfaced
The service methods throw meaningful `HttpException`s like `BadRequestException` and `NotFoundException`. These are caught in controllers and re-thrown if needed. Unexpected errors are wrapped in a generic `InternalServerErrorException` to avoid leaking internal details.

### Why rate limiting was implemented
Rate limiting helps mitigate brute force and DoS attacks by restricting request rate. This application uses the `ThrottlerModule` from `@nestjs/throttler` to implement rate limiting. For more information, see the [official documentation](https://docs.nestjs.com/security/rate-limiting).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL

### Installation

```bash
# Clone the repo
git clone https://github.com/mohamedsamy911/fintech-application
cd fintech-application

# Install dependencies
npm install
```

### Environment Variables
Create a `.env` file:

```env
PORT=3000 #(optional) server default port is 3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=fintech
```

---

## 🧪 Running the App

### Start the server
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Run tests
```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

### Run with Docker
```bash
docker build -t nestjs-fintech .
docker run -p 3000:3000 nestjs-fintech
```

### Run with Docker Compose
```bash
docker compose up -d
```

---

## 🧭 API Endpoints

| Method | Endpoint                        | Description                       |
|--------|---------------------------------|-----------------------------------|
| POST   | `/accounts`                     | Create a new account              |
| GET    | `/accounts/:id`                 | Check account balance             |
| POST   | `/transactions`                 | Create a transaction              |
| GET    | `/transactions/:accountId`      | Check account transaction history |

#### Sample Transaction Request
```json
{
  "accountId": "uuid-account-id",
  "amount": 100,
  "type": "DEPOSIT"
}
```

---

## 🧾 Technologies Used
- **NestJS** (Node.js framework)
- **TypeORM** (PostgreSQL ORM)
- **Jest** (unit testing)
- **Docker** (containerization)
- **Swagger** (API docs)

---

## 📚 Documentation
- Swagger is available at `/api` once the server is running.
- For detailed request/response bodies, see `src/accounts` and `src/transactions` modules.

---

## 🙌 Author
- Mohamed Samy
- [GitHub Profile](https://github.com/mohamedsamy911)

---

## 📄 License
This project is licensed under the MIT License.
