# Tomato OTP Backend (Node/Express)

This backend is meant to prevent the mobile app from calling Firebase phone auth APIs directly.

## Endpoints

- `POST /auth/phone/start`
  - body: `{ "phoneNumber": "+91XXXXXXXXXX" }`
  - returns: `{ "sessionId": "...", "ttlMs": 300000 }`

- `POST /auth/phone/verify`
  - body: `{ "sessionId": "...", "code": "123456" }`
  - returns: `{ "firebaseCustomToken": "..." }`

## Important
Firebase Admin SDK does **not** provide the same client phone-auth APIs (`signInWithPhoneNumber`, `confirm`).
To make this work securely, you must implement `generateFirebaseCredentialForOtp()` in `server/services/firebasePhone.js`
using a server-side verification flow for your Firebase project.

## Config
Create `server/.env` (or copy from `.env.example`).

- `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_ADMIN_CREDENTIALS_JSON`
- `PORT`

## Run

```bash
cd server
npm start
```

Health:
- `GET /health`

