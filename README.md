# 🕵️ RevealX — Zero-Knowledge Encrypted Messaging

**Secrets revealed only at the right moment.**

RevealX is a full-stack messaging application that lets users write secret messages, lock them until a chosen date and time, and share them through a unique link. Messages are encrypted in the browser before being sent to the server, so the backend stores ciphertext instead of plaintext.

The recipient can enter the correct passphrase to decrypt the message once the reveal time has arrived.

> 🔐 Your secret. Your passphrase. Your moment.

---

## ✨ Features

- **🔐 Client-Side Encryption:** AES-256-GCM encryption using the browser-native Web Crypto API.
- **🔑 Secure Key Derivation:** PBKDF2 with SHA-256, 100,000 iterations, and a randomly generated salt.
- **⏰ Time-Locked Messages:** Set a reveal date and time for each secret.
- **🔗 Shareable Links:** Generate unique public links that recipients can access without creating an account.
- **📧 Email Notifications:** Send email notifications when notes are created and when they become eligible for reveal.
- **⏳ Live Countdown:** Display the remaining time until a secret can be revealed.
- **👤 User Authentication:** JWT-based authentication using HTTP-only cookies.
- **🔒 Note Ownership:** Restrict private note operations to their respective owners.
- **🧹 Automatic Expiration:** Use MongoDB TTL indexes to automatically remove expired notes.
- **🎨 Dark UI:** A dark-themed interface designed around the secret-reveal experience.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, React Router v6, JavaScript |
| Encryption | Web Crypto API, AES-256-GCM, PBKDF2 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, HTTP-only cookies, bcryptjs |
| Email | Nodemailer |
| Security | express-rate-limit, authenticated ownership checks |
| Development | npm, dotenv |

## 🔐 How Encryption Works

RevealX encrypts messages in the browser before they reach the backend.

```text
                 User's Message
                        |
                        v
              Passphrase + Random Salt
                        |
                        v
              PBKDF2 Key Derivation
                 SHA-256 / 100K
                        |
                        v
                AES-256-GCM Key
                        |
                        v
                 Encrypt Message
                        |
                        v
          +---------------------------+
          | Ciphertext + IV + Salt    |
          +---------------------------+
                        |
                        v
                 Express Backend
                        |
                        v
                   MongoDB
```

### Encryption flow

1. The user enters a secret message and a passphrase.
2. RevealX generates a random salt and initialization vector (IV).
3. PBKDF2 derives an encryption key from the passphrase and salt.
4. AES-256-GCM encrypts the message in the browser.
5. The backend receives and stores the encrypted payload alongside the reveal time and note metadata.
6. When the reveal time arrives, the recipient submits the passphrase.
7. The browser derives the key again and decrypts the ciphertext locally.

**Important:** The passphrase is never intentionally sent to or stored by the backend. Anyone attempting decryption with an incorrect passphrase should receive an authentication failure from AES-GCM.

### Security principles

- Plaintext is encrypted before being submitted to the server.
- Encryption keys are derived locally rather than stored in the database.
- AES-GCM provides confidentiality and integrity protection for the encrypted payload.
- HTTP-only cookies help prevent JavaScript from directly reading the authentication token.
- Ownership checks restrict access to private notes.
- Rate limiting helps reduce brute-force and abusive requests.

*Security note:* Time locking is an application-level access restriction, not a cryptographic time-lock. The recipient's browser controls when the decryption interface becomes available. A recipient who obtains the ciphertext and passphrase may be able to decrypt the message earlier using another client. A compromised browser or server can also affect security. RevealX should not be described as formally audited or as guaranteeing complete zero-knowledge security without further verification.

## 🏗️ Project Structure

```text
RevealX/
├── backend/
│   ├── models/
│   │   └── Note.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── notes.js
│   ├── middleware/
│   │   └── protect.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateNote.js
│   │   │   ├── ViewNote.js
│   │   │   └── RevealNote.js
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── README.md
```

*The directory tree is illustrative. Adjust filenames and folders to match the actual repository.*

## 🚀 Getting Started

Follow these steps to run RevealX locally.

### Prerequisites

Install or configure the following:

- [Node.js](https://nodejs.org/) 18 or later
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a MongoDB Atlas database
- npm
- A Gmail account with a configured Google App Password for email notifications

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd RevealX
```

Replace the placeholder with your actual repository URL.

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
MONGO_URI=mongodb://127.0.0.1:27017/revealx
PORT=5001
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:3000

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

**Configuration notes:**

- Replace `JWT_SECRET` with a strong, randomly generated secret.
- Use a Gmail App Password rather than your regular Gmail password.
- Ensure MongoDB is running locally or replace `MONGO_URI` with your Atlas connection string.
- Configure email credentials if you want email notifications to work.

Start the backend:

```bash
npm run dev
```

The backend should start on `http://localhost:5001`, assuming the configured port is available.

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
PORT=3000
REACT_APP_API_URL=http://localhost:5001
```

Start the frontend:

```bash
npm start
```

Open `http://localhost:3000` in your browser.

> **Note:** These commands assume the project uses the standard Create React App scripts and a backend `dev` script. Adjust them if your `package.json` files use different commands.

## 🔌 API Reference

All endpoints are relative to the backend base URL, such as `http://localhost:5001`.

### Authentication

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a user |
| POST | `/api/auth/login` | Public | Log in |
| POST | `/api/auth/logout` | Public | Log out and clear the session cookie |
| GET | `/api/auth/me` | Required | Retrieve the current user |

### Notes

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| POST | `/api/notes` | Required | Create an encrypted note |
| GET | `/api/notes/summary` | Required | Retrieve the user's notes summary |
| GET | `/api/notes/:id` | Required | Retrieve an owned note |
| POST | `/api/notes/:id/reveal` | Required | Confirm reveal for an owned note |
| GET | `/api/notes/shared/:token` | Public | Retrieve a shared note |
| POST | `/api/notes/shared/:token/reveal` | Public | Request reveal of a shared note |

Protected endpoints require a valid authentication session. Public shared-note endpoints use the share token to identify the note.

## 🛡️ Security Overview

| Threat | Mitigation |
|---|---|
| Database exposure | Store encrypted message content rather than plaintext |
| Password compromise | Hash account passwords using bcrypt |
| Authentication token theft through JavaScript | Use HTTP-only cookies |
| Brute-force and request abuse | Apply rate limiting |
| Unauthorized private-note access | Verify note ownership on protected routes |
| Incorrect message passphrase | AES-GCM authentication rejects invalid decryption |
| Unnecessary retention | Configure MongoDB TTL-based note expiration |

These controls reduce specific risks; they do not eliminate every attack vector. Production deployment should also include HTTPS, secure cookie settings, appropriate CORS configuration, input validation, secret management, and security testing.

## 🗺️ Roadmap

- [x] Client-side AES-256-GCM encryption
- [x] PBKDF2-based key derivation
- [x] JWT authentication with HTTP-only cookies
- [x] Time-based reveal workflow
- [x] Shareable recipient links
- [x] Email notifications
- [x] Live countdown timer
- [x] Dark UI theme
- [x] Automatic note expiration
- [ ] Password reset workflow
- [ ] Automated tests with Jest and Supertest
- [ ] Production deployment and security hardening

*Update the checklist to reflect the actual state of the repository. A feature should be marked complete only when it has been implemented and verified.*

## 🔮 Future Improvements

- Stronger automated security and integration tests
- Better handling of expired, deleted, and invalid share links
- Improved email delivery reliability and retry handling
- More granular rate limits for authentication and decryption attempts
- Accessibility improvements and responsive UI refinements
- A documented threat model and independent security review

## 👩‍💻 Author

**Bhumika Rajput**

Built as a full-stack portfolio project to explore client-side cryptography, authentication, secure API design, and time-based message sharing.

---

**RevealX — Because some secrets deserve a dramatic reveal.** 🕵️🔐
