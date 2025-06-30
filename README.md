# 💸 NestJS Fintech API

This is a **NestJS-based backend service** for a simple fintech application. It allows users to:

- ✅ Create a new account
- 💰 Deposit or withdraw money
- 📊 Check account balance

---

## 🛠️ Features

- RESTful APIs for account and transaction management
- Input validation using `class-validator`
- Error handling with proper HTTP status codes
- Swagger documentation support
- Unit-tested services and controllers
- Docker support for easy deployment

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

| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| POST   | `/accounts`          | Create a new account   |
| GET    | `/accounts/:id`      | Check account balance  |
| POST   | `/transactions`      | Create a transaction   |

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
- Your Name
- [GitHub Profile](https://github.com/mohamedsamy911)

---

## 📄 License
This project is licensed under the MIT License.
