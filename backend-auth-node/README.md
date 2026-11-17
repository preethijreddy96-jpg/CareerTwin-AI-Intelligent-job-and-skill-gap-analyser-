# CareerTwin AI - Node.js Authentication Microservice

This microservice handles **all authentication backend logic** for CareerTwin AI using Node.js and Express:
- User registration with password complexity enforcement and duplicate email protection
- Direct user login with bcrypt password verification
- Email and 2-step verification code management
- Google OAuth and device sign-in authentication
- JWT access token generation and validation (`HS256`, 7-day expiration)
- Built-in rate limiting protection (100 requests / minute)
- Native SQLite database access via `node:sqlite` directly interacting with `careertwin.db`

## Architecture & Routing

- **Port:** `5001`
- **Database:** `../backend/careertwin.db` (Shared with FastAPI)
- **Vite Proxy:**
  - `/api/auth/*` -> `http://127.0.0.1:5001` (Node.js Auth Service)
  - `/api/*` -> `http://127.0.0.1:8001` (FastAPI AI & Core Backend)

## Running the Service

```bash
cd backend-auth-node
npm install
node server.js
```
