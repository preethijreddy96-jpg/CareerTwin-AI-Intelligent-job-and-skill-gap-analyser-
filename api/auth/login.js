// Vercel Serverless Function for /api/auth/login
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

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const isDemo = cleanEmail === 'demo.developer@careertwin.ai';

  if (isDemo) {
    const validPasswords = ['DemoCareer2026!#', 'DemoCareer2026!', 'DemoCareer2026'];
    if (!validPasswords.includes(password)) {
      return res.status(401).json({ detail: 'Incorrect email or password. Please check your credentials.' });
    }
  } else if (password.length < 6) {
    return res.status(401).json({ detail: 'Password must be at least 6 characters long.' });
  }

  const fullName = isDemo ? 'Demo Candidate' : cleanEmail.split('@')[0];
  const userId = isDemo ? 2 : Math.floor(Date.now() % 1000000);
  const token = createSimpleJwt({ sub: cleanEmail, user_id: userId });

  return res.status(200).json({
    access_token: token,
    token_type: 'bearer',
    user_id: userId,
    email: cleanEmail,
    full_name: fullName,
    requires_2fa: false,
    message: `Welcome back, ${fullName}!`
  });
};
