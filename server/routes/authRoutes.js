import { adminAuth } from '../services/firebaseAdmin.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function verifyFirebaseToken(req, res) {

  try {

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required',
      });
    }

    // Verify Firebase ID token
    const decoded = await adminAuth.verifyIdToken(token);

    // Create our own JWT for app sessions
    const payload = {
      uid: decoded.uid,
      phoneNumber: decoded.phone_number,
      email: decoded.email || null,
    };

    const appToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      success: true,
      uid: decoded.uid,
      phoneNumber: decoded.phone_number,
      jwt: appToken,
    });

  } catch (error) {

    console.log(error);

    return res.status(401).json({
      success: false,
      error: 'Invalid Firebase token',
    });
  }
}