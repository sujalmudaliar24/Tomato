import { Platform } from 'react-native';

type StartPhoneResponse = {
  sessionId: string;
  ttlMs?: number;
};

type VerifyPhoneResponse = {
  firebaseCustomToken: string;
};

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';


async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg = typeof json?.error === 'string' ? json.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return json as T;
}

export async function startPhoneAuth(phoneNumberE164: string): Promise<StartPhoneResponse> {
  return postJson<StartPhoneResponse>('/auth/phone/start', { phoneNumber: phoneNumberE164 });
}

export async function verifyPhoneAuth(sessionId: string, code: string): Promise<VerifyPhoneResponse> {
  return postJson<VerifyPhoneResponse>('/auth/phone/verify', { sessionId, code });
}

export async function verifyToken(token: string) {
  return postJson<any>('/auth/verify-token', { token });
}

