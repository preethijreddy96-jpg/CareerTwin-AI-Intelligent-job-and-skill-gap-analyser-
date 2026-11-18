// Vercel Serverless Function for /api/auth/resend-code
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { email } = req.body || {};
  const cleanEmail = (email && typeof email === 'string') ? email.trim().toLowerCase() : 'candidate@careertwin.ai';
  const code = `${Math.floor(100000 + Math.random() * 900000)}`;

  return res.status(200).json({
    message: 'Verification code resent successfully.',
    email: cleanEmail,
    dev_verification_code: code
  });
};
