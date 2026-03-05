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

**Backend:** Node.js, Express, MongoDB + Mongoose, bcryptjs, jsonwebtoken, nodemailer, express-rate-limit

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gmail App Password

### Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/revealx
PORT=5001
JWT_SECRET=your-secret-here
FRONTEND_URL=http://localhost:3000
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your-app-password
```
```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
PORT=3000
REACT_APP_API_URL=http://localhost:5001
```
```bash
npm start
```

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|:----:|-------------|
| POST | `/api/auth/register` | ❌ | Register |
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/logout` | ❌ | Logout |
| GET | `/api/auth/me` | ✅ | Current user |
| POST | `/api/notes` | ✅ | Create note |
| GET | `/api/notes/summary` | ✅ | My notes |
| GET | `/api/notes/:id` | ✅ | View note (owner) |
| POST | `/api/notes/:id/reveal` | ✅ | Confirm reveal |
| GET | `/api/notes/shared/:token` | ❌ | Public — recipient view |
| POST | `/api/notes/shared/:token/reveal` | ❌ | Public — confirm reveal |

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