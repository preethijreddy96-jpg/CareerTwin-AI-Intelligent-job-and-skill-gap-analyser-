// Vercel Serverless Function for /api/auth/me
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Not authenticated. Bearer token missing.' });
  }

  return res.json({
    id: 2,
    email: 'demo.developer@careertwin.ai',
    full_name: 'Demo Candidate',
    is_active: 1,
    is_verified: 1
  });
};
