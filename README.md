# VOLTA — Next-Gen Digital Banking & Financial Ledger

A secure, institutional-grade double-entry banking platform and financial ledger application built with Node.js/Express, MongoDB multi-document transactions, JWT zero-trust authentication, Nodemailer notifications, and a modern React dashboard.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Variables
Ensure `.env` exists in the root directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
CLIENT_ID=your_google_oauth2_client_id
CLIENT_SECRET=your_google_oauth2_client_secret
REFRESH_TOKEN=your_google_oauth2_refresh_token
PORT=3000
```
*(See `.env.example` for reference)*

### 3. Run the Full Stack App
```bash
# Run both Backend (Port 3000) and Frontend (Port 5173) concurrently:
npm run full
```
Or start them separately:
```bash
# Backend (Port 3000)
npm run dev

# Frontend (Port 5173)
npm run frontend
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🏛 System Architecture

### Double-Entry Ledger Principles
* **Every transaction is balanced**: A transfer creates a DEBIT ledger entry on the sender account and an equal CREDIT ledger entry on the recipient account.
* **Derived balances**: Account balances are not stored as mutable values; they are dynamically computed via MongoDB aggregation pipelines over immutable ledger records.
* **ACID Transactions**: Transfer flows execute inside a MongoDB multi-document session with rollback on failure.
* **Idempotency Guard**: Every transfer requires a unique `idempotencyKey` preventing duplicate charges on retried network requests.

### Authentication & Security
* **JWT Authentication**: Signed tokens containing user IDs with 3-day validity.
* **Token Blacklisting**: Logout immediately blacklists tokens in MongoDB.
* **Dual Header & Cookie Support**: Supports standard `Authorization: Bearer <token>` and `HttpOnly` cookies.
* **Password Hashing**: Bcrypt with 10 salt rounds.

---

## 📡 API Endpoints

### Auth Routes (`/api/auth`)
* `POST /api/auth/register` - Create account & send welcome email
* `POST /api/auth/login` - Sign in & issue token
* `POST /api/auth/logout` - Invalidate session & blacklist token

### Account Routes (`/api/accounts`)
* `POST /api/accounts` - Open a new ledger account
* `GET /api/accounts` - List all accounts owned by current user
* `GET /api/accounts/balance/:accountId` - Compute real-time balance

### Transaction Routes (`/api/transactions`)
* `GET /api/transactions` - List all user transactions (sent and received)
* `POST /api/transactions` - Send money between accounts (10-step flow)
* `POST /api/transactions/deposit` - Deposit / faucet funds to an account
* `POST /api/transactions/system/initial-funds` - System user initial grant

---

## 🖥 Frontend Features
* **Modern Banking UI**: Sleek dark-mode aesthetic with real-time feedback.
* **Dashboard Tab**: High-level balance analytics, quick actions, and recent transaction history.
* **Transfer Tab**: Step-by-step transfer modal with idempotency key generation.
* **Deposit Faucet**: Add test balance to any account instantly for testing.
* **Accounts Tab**: View account cards, copy account IDs, and open new accounts.
* **Security Center**: Identity, session, and double-entry compliance details.
