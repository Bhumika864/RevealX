# Invisinotes Agent Guide

## Commands
- **Backend**: `cd backend && npm run dev` (development), `npm start` (production), `npm test` (no tests configured)
- **Frontend**: `cd frontend && npm start` (dev server), `npm run build` (production), `npm test` (run tests)
- **Start script**: `start-sweetnotes.bat` (Windows batch file to start both frontend and backend)

## Architecture
- **Stack**: MERN (MongoDB + Express + React + Node.js), end-to-end encryption with CryptoJS (AES-256-CBC)
- **Backend** (`backend/`): Express REST API, Mongoose models (Note, Subscription), Web Push notifications
  - `server.js`: Main entry, configures VAPID for web push, loads routes from `routes/`
  - `routes/notes.js`: POST `/api/notes`, GET `/api/notes/:id` (returns encrypted message before reveal time)
  - `models/`: Mongoose schemas (Note: sender, receiver, message, iv, revealDate)
  - `jobs/scheduler.js`: Background job to send push notifications when notes are revealed
  - `utils/`: Validation helpers (validateDate.js, isValidObjectId.js)
- **Frontend** (`frontend/`): React SPA with React Router, `react-datepicker`, `crypto-js` for encryption
  - Main components: `CreateNote.js`, `ViewNote.js`, `YourNotes.js`, `Landing.js`
  - Encryption: AES key generated client-side, message encrypted with IV, key sent in URL query param
- **Database**: MongoDB (connection via MONGO_URI env var), stores encrypted messages with IV but never stores keys

## Code Style
- Use `require()` for imports in backend (CommonJS), ES6 imports (`import`) in frontend
- Follow existing patterns: Express route handlers in `routes/`, Mongoose models in `models/`, utilities in `utils/`
- Error handling: Return JSON with `{ error: "message" }` and appropriate HTTP status codes (400, 404, 500)
- Validation: Always validate input (check required fields, types, date formats, ObjectIds)
- No TypeScript, uses plain JavaScript; no strict linting configured
- Frontend uses functional components with hooks (`useState`, `useNavigate`)
