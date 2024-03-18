const route = require('express').Router()
const basicAuth = require('../middleware/basicAuth')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authorize = require('../middleware/authorize')

// array to store users
const users = []

/**
 * Create a user (sign up)
 */
route.post('/', basicAuth, async (req, res) => {
  // get the user data, thanks to basicAuth middleware!
  const { email, password } = req.user
  const id = users.length + 1

  /* To test this, we want to create an authorization header, we can do this through
    echo -n 'magnan@taskm.com:forever11' | base64
    bWFnbmFuQHRhc2ttLmNvbTpmb3JldmVyMTE=

    echo -n 'admin@taskm.com:rootuser' | base64
    YWRtaW5AdGFza20uY29tOnJvb3R1c2Vy

  */


  // hash the password
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  console.log("hashed", hashedPassword)
  console.log("password", password)

/* example - returns:
  hashed $2b$10$lHmiXGV3CBglqRv9ZDy/cuL.zS8IoDMEa4B.fejbPAef3JqSLtQru
  password password123456
*/

  const user = {
    id,
    email,
    password: hashedPassword
  }

  // save the user
  users.push(user)

  // don't send back the hashed password
  res.status(201).json({ id, email })
})

/**
 * BONUS:
 * Get the user specified by the Authorization header
 */

/**
 * Sign in a user
 */
route.post('/login', basicAuth, async (req, res) => {
  // get the user from the database
  const user = users.find(user => user.email === req.user.email)

  // make sure the user exists
  if (!user) {
    return res.status(404).send({ error: 'User not found.' })
  }

  // compare the provided password with the hashed password from the db
  const result = await bcrypt.compare(req.user.password, user.password)

  if (!result) {
    return res.status(401).json({ error: 'Incorrect password' })
  }

  // make a payload
  const payload = { id: user.id, email: user.email }

  // sign and encode the payload to create the token
  const accessToken = jwt.sign(payload, process.env['TOKEN_SECRET'])  //authentication example!
  console.log("JWT:", accessToken)
  console.log(process.env['TOKEN_SECRET'])

  // send the token back for storage on the client
  res.json({ accessToken })
})

/**
 * Get the user specified by the Authorization header
 */
route.get('/', authorize, async (req, res) => {
  /**
   * Note that this endpoint no longer needs to repeat all the authentication logic!
   * The The authorize middleware verifies and parses the token, then attaches the
   * payload to req.user for return.
   */
  res.json(req.user)
})


route.get('/', basicAuth, async (req, res) => {
  // get the user from the database
  const user = users.find(user => user.email === req.user.email)

  // make sure the user exists
  if (!user) {
    return res.status(404).send({ error: 'User not found.' })
  }

  // compare the provided password with the hashed password from the db
  const result = await bcrypt.compare(req.user.password, user.password)

  if (!result) {
    return res.status(401).json({ error: 'Incorrect password' })
  }

  // don't send back the hashed password
  res.json({ id: user.id, email: user.email })
})

module.exports = route
