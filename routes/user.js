const route = require('express').Router()
const basicAuth = require('../middleware/basicAuth')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authorize = require('../middleware/authorize')

// array to store users
const users = []

// Sign up a user
route.post('/', basicAuth, async (req, res) => {
  // get the user data, with basicAuth middleware
  const { email, password } = req.user
  const id = users.length + 1

  // hash the password
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

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

// Log in a user and return a JWT
route.post('/login', basicAuth, async (req, res) => {


// get the user data, with basicAuth middleware
  const user = users.find(user => user.email === req.user.email)

// check if the user exists
  if (!user) {
    return res.status(404).send({ error: 'User not found.' })
  }

// compare the hashed password with the user input
  const result = await bcrypt.compare(req.user.password, user.password)

  if (!result) {
    return res.status(401).json({ error: 'Incorrect password' })
  }

// create the payload
  const payload = { id: user.id, email: user.email }

// create the JWT and send it back to the client (authentication )
  const accessToken = jwt.sign(payload, process.env['TOKEN_SECRET'])  
  console.log("JWT:", accessToken)
  console.log(process.env['TOKEN_SECRET'])

  // send the token back for storage on the client
  res.json({ accessToken })
})

// Get the user's data (profile)
route.get('/', authorize, async (req, res) => {
  res.json(req.user)
})



module.exports = route
