import { adminAuth } from '../services/firebaseAdmin.js';

export async function verifyFirebaseToken(req, res) {

  try {

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required',
      });
    }

    // Verify Firebase ID token
    const decoded = await adminAuth.verifyIdToken(
      token
    );

    return res.json({
      success: true,
      uid: decoded.uid,
      phoneNumber: decoded.phone_number,
    });

  } catch (error) {

    console.log(error);

    return res.status(401).json({
      success: false,
      error: 'Invalid Firebase token',
    });
  }
}