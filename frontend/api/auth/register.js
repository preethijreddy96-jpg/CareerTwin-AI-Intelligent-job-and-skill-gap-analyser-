// Vercel Serverless Function for /api/auth/register
const crypto = require('crypto');

function createSimpleJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = Buffer.from(JSON.stringify({ ...payload, iat: now, exp: now + 7 * 86400 })).toString('base64url');
  const signature = crypto.createHmac('sha256', 'super-secret-careertwin-key-change-in-production-2026')
    .update(`${header}.${fullPayload}`)
    .digest('base64url');
  return `${header}.${fullPayload}.${signature}`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { full_name, email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(422).json({ detail: 'Please enter a valid email address.' });
  }

  if (!password || password.length < 6) {
    return res.status(422).json({ detail: 'Password must be at least 6 characters long.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (full_name && full_name.trim()) ? full_name.trim() : cleanEmail.split('@')[0];
  const userId = Math.floor(Date.now() % 1000000);
  const token = createSimpleJwt({ sub: cleanEmail, user_id: userId });

  return res.status(201).json({
    message: `Welcome to CareerTwin AI, ${cleanName}!`,
    email: cleanEmail,
    requires_verification: false,
    dev_verification_code: null,
    access_token: token,
    token_type: 'bearer',
    user_id: userId,
    full_name: cleanName
  });
};
