import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import {
  verifyFirebaseToken,
} from './routes/authRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());


// HOME ROUTE
app.get('/', (_req, res) => {
  res.send('Backend Running Successfully');
});


// HEALTH ROUTE
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});


// VERIFY TOKEN ROUTE
app.post(
  '/auth/verify-token',
  verifyFirebaseToken
);


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {

  console.log(
    `[server] listening on http://localhost:${PORT}`
  );

});