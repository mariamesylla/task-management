const jwt = require('jsonwebtoken');
const route = require('express').Router();
const basicAuth = require('../middleware/basicAuth');
const bcrypt = require('bcrypt');
const authorize = require('../middleware/authorize');

const { requiresAuth } = require('express-openid-connect');

// Array to store users
const users = [];

/**
 * GET user profile (requires authentication)
 */
route.get('/', requiresAuth(), async (req, res) => {
  res.json(req.oidc.user);
});

/**
 * Create a user (sign up)
 */
route.post('/', basicAuth, async (req, res) => {
  // Get the user data, thanks to basicAuth middleware!
  const { email, password } = req.user;
  const id = users.length + 1;

  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = {
    id,
    email,
    password: hashedPassword
  };

  // Save the user
  users.push(user);

  // Don't send back the hashed password
  res.status(201).json({ id, email });
});

/**
 * Sign in a user
 */
route.post('/login', basicAuth, async (req, res) => {
  // Get the user from the database
  const user = users.find(user => user.email === req.user.email);

  // Make sure the user exists
  if (!user) {
    return res.status(404).send({ error: 'User not found.' });
  }

  // Compare the provided password with the hashed password from the db
  const result = await bcrypt.compare(req.user.password, user.password);

  if (!result) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  // Make a payload
  const payload = { id: user.id, email: user.email };

  // Sign and encode the payload to create the token
  const accessToken = jwt.sign(payload, process.env.TOKEN_SECRET);

  // Send the token back for storage on the client
  res.json({ accessToken });
});

/**
 * BONUS:
 * Get the user specified by the Authorization header
 */
route.get('/profile', authorize, async (req, res) => {
  res.json(req.user);
});

module.exports = route;