// Vercel Serverless Function for /api/auth/google
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

  const { credential, email, full_name, password } = req.body || {};

  let targetEmail = email;
  let targetName = full_name;

  if (credential) {
    try {
      // Decode JWT token payload from Google ID token
      const parts = credential.split('.');
      if (parts.length >= 2) {
        const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
        const googleUser = JSON.parse(payloadJson);
        if (googleUser.email) {
          targetEmail = googleUser.email;
          targetName = googleUser.name || targetEmail.split('@')[0];
        }
      }
    } catch (e) {
      // Fall through to email
    }
  }

  const cleanEmail = (targetEmail && typeof targetEmail === 'string')
    ? targetEmail.trim().toLowerCase()
    : 'google.candidate@careertwin.ai';
  const cleanName = targetName || cleanEmail.split('@')[0];
  const userId = Math.floor(Date.now() % 1000000);
  const token = createSimpleJwt({ sub: cleanEmail, user_id: userId });

  return res.status(200).json({
    access_token: token,
    token_type: 'bearer',
    user_id: userId,
    email: cleanEmail,
    full_name: cleanName,
    message: `Signed in with Google as ${cleanName}`
  });
};
