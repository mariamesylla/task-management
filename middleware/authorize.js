const jwt = require('jsonwebtoken')

// This middleware is used to verify the token and attach the payload to req.user
async function authorize(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Access ')) {
    return res.status(401).json({ error: 'Access Unauthorized' })
  }

  const accessToken = authHeader.split(' ')[1]

  try {
    req.user = jwt.verify(accessToken, process.env['TOKEN_SECRET'])
    next()
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' })
  }
}

module.exports = authorize