// Vercel Serverless Function for /api/auth/google/status
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || null;
  return res.status(200).json({
    configured: Boolean(clientId),
    client_id: clientId,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || null
  });
};
