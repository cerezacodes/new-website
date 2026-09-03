export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const { type, password } = req.body || {};

  if (!type || !password) {
    return res.status(400).json({ ok: false, message: 'Missing type or password' });
  }

  const validPasswords = {
    admin: process.env.ADMIN_PASSWORD,
    writer: process.env.WRITER_PASSWORD
  };

  const expected = validPasswords[type];
  const ok = Boolean(expected) && password === expected;

  return res.status(200).json({ ok });
}