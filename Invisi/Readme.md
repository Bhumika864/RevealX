# 🕵️‍♂️ RevealX
> Zero-knowledge encrypted messaging — secrets revealed only at the right moment.

---

## What is RevealX?

Write a secret message, set a reveal time, and share a link. The message is **encrypted in your browser** before it ever touches the server — not even the database can read it. The recipient enters a passphrase after the timer hits zero, and the secret unlocks.

---

## Features

- 🔐 **AES-256-GCM** client-side encryption via the browser-native **Web Crypto API**
- 🔑 **PBKDF2** key derivation (100,000 iterations, random salt)
- ⏰ Time-locked reveals — messages unlock only at your chosen datetime
- 🔗 Unique public shareable link per note — no login needed for recipients
- 📧 Automated email notifications on creation and at reveal time
- ⏱️ Live countdown timer on the recipient's page
- 👤 JWT authentication with httpOnly cookies (XSS-safe)
- 🔒 Per-note ownership — users only access their own notes
- 🧹 Auto-deletion via MongoDB TTL index

---

## How Encryption Works

```
passphrase + random salt
        │
        ▼
PBKDF2 → AES-256-GCM key
        │
        ▼
encrypt(message) → { cipherText, iv, salt }
        │
        ▼
Only encrypted blob sent to server — plaintext never leaves your browser
```

> The passphrase is never stored or transmitted. Even a database breach reveals nothing.

---

## Tech Stack

**Frontend:** React 18, Web Crypto API, React Router v6, react-datepicker

**API Gateway:** Node.js, Express, Redis-backed rate limiting

**Load Balancer:** Nginx

**Services:** Auth, Note, and Reveal (Node.js + Express)

**Background worker:** Notification delivery (not an HTTP microservice)

**Data:** MongoDB + Mongoose

## Service Architecture (Current Stage)

The source tree has one shared frontend application and separate backend folders for the independently deployable services:

```text
apps/
└── frontend/                   # Existing shared React app (auth + notes + reveal)
services/
├── auth/backend/
│   ├── config/                 # MongoDB connection
│   ├── controllers/            # Register, login, logout, current user
│   ├── middleware/             # JWT protection and errors
│   ├── models/                  # User schema
│   ├── routes/                  # /api/auth endpoints
│   ├── services/                # Auth and token logic
│   └── utils/                   # User response serialization
├── note/backend/
│   ├── config/                 # MongoDB connection
│   ├── controllers/            # Note and internal API handlers
│   ├── middleware/             # JWT protection, request validation, errors
│   ├── models/                  # Note schema
│   ├── routes/                  # Public note and private internal routes
│   ├── services/                # Note persistence and reveal state
│   └── utils/                   # Date, ID, and reveal response helpers
└── reveal/backend/
    ├── config/                 # Note service URL
    ├── controllers/            # Public reveal request handling
    ├── middleware/             # Error handling
    ├── routes/                  # Reveal and health endpoints
    ├── services/                # Private Note API client
    └── utils/                   # Shared-note path construction
workers/
└── notification/
    ├── config/                  # Email transport
    ├── services/                # Note API client and email workflow
    ├── utils/                   # Email HTML escaping
    └── worker.js                # Background process entry point
gateway/                         # API gateway
load-balancer/                   # Nginx routing
```

The existing React files were moved into `apps/frontend/` without editing their contents. The gateway keeps the frontend's existing API paths. Nginx routes `/api/auth/*` to Auth, `/api/notes/shared/*` to Reveal (rewritten internally to `/api/reveal/*`), and the other `/api/notes/*` endpoints to Note. Reveal asks Note's private internal API for shared-note data and reveal confirmation; only Note accesses the Note model. Auth issues JWTs, and Note validates them without querying Auth on every request.

The replaced monolithic backend has been removed from the working project; active backend code lives under each service's `backend/` folder. The new service backends currently use separate collections in the existing MongoDB database to preserve local data. Splitting them into separate databases is a later migration. The Notification worker polls Note's private internal API for pending share and reveal emails; it does not connect to MongoDB or accept public requests. Only the API gateway is published (`http://localhost:5001`); service ports, Nginx, Redis, and MongoDB remain on the Compose network.

Set a strong `JWT_SECRET` in the environment or `Invisi/.env` before starting. The same value must be available to Auth and Note. Set `EMAIL_USER` and `EMAIL_PASS` to enable email. Scale each API service independently:

```bash
docker compose up --build --scale auth-service=2 --scale note-service=2 --scale reveal-service=2
```

The notification worker runs once per Compose stack and polls Note for pending email work. Keep it as a single worker instance to avoid duplicate deliveries.

Start the stack from `Invisi/`:

```bash
docker compose up --build
```

The gateway readiness endpoint is `http://localhost:5001/health`. Redis must be available for the gateway to start.

---

## Local Setup

### Prerequisites
- Docker Desktop with Docker Compose
- Node.js 20+ if running the frontend outside Docker
- Gmail App Password (optional; required only for email delivery)

For local development, create `Invisi/.env`:
```env
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:3000
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your-app-password
```

Generate a secret with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` and put the result in `JWT_SECRET`. Auth and Note must use the same value.

The notification worker runs as part of Docker Compose.

### Frontend
```bash
cd apps/frontend
npm install
```

Create `apps/frontend/.env`:
```env
PORT=3000
REACT_APP_API_URL=http://localhost:5001
```
```bash
npm start
```

---

## API Routes

| Method | Route | Auth | Service | Description |
|--------|-------|:----:|---------|-------------|
| POST | `/api/auth/register` | ❌ | Auth | Register |
| POST | `/api/auth/login` | ❌ | Auth | Login |
| POST | `/api/auth/logout` | ❌ | Auth | Logout |
| GET | `/api/auth/me` | ✅ | Auth | Current user |
| POST | `/api/notes` | ✅ | Note | Create note |
| GET | `/api/notes/summary` | ✅ | Note | My notes |
| GET | `/api/notes/:id` | ✅ | Note | View note (owner) |
| POST | `/api/notes/:id/reveal` | ✅ | Note | Confirm owner reveal |
| GET | `/api/notes/shared/:token` | ❌ | Reveal | Recipient view |
| POST | `/api/notes/shared/:token/reveal` | ❌ | Reveal | Confirm public reveal |

---

## Security

| Threat | Protection |
|--------|-----------|
| Password breach | bcrypt (12 rounds) |
| XSS token theft | JWT in httpOnly cookie |
| Brute force | Rate limiting on all routes |
| Database breach | AES-256-GCM — unreadable without passphrase |
| Wrong passphrase | GCM auth tag auto-rejects |
| Note hijacking | Owner ID verified on every route |
| Stale notes | MongoDB TTL auto-deletion |

---

## Roadmap

- [x] AES-256-GCM client-side encryption
- [x] Time-locked reveals
- [x] User auth (JWT + httpOnly cookies)
- [x] Shareable recipient links
- [x] Email notifications
- [x] Live countdown timer
- [x] Dark UI theme
- [ ] Note deletion
- [ ] Password reset
- [ ] Tests (Jest + Supertest)
- [ ] Deploy (Vercel + Render + MongoDB Atlas)

---

## Author

**Bhumika Rajput** — Built with 💜 as a full-stack portfolio project


*RevealX — Because some secrets deserve a dramatic reveal.*
