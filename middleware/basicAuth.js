// This middleware is used to authenticate the user using basic auth
function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const encodedCredentials = authHeader.split(' ')[1]
  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString(
    'utf-8'
  )
  const [email, password] = decodedCredentials.split(':')

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  req.user = { email, password }
  next()
}

module.exports = basicAuth