require('dotenv').config()
const express = require('express')
const routes = require('./routes');
const { auth } = require('express-openid-connect');

const app = express()
const PORT = 4000

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:4000',
  clientID: 'r6k6Qugzo6DmFAuSjjmwtkiE9WlexKzr',
  issuerBaseURL: 'https://dev-kqcvt5qlx045drmf.us.auth0.com'
};

app.use(express.json())

app.use(auth(config))

app.use('/user', routes.user)
app.use('/tasks', routes.tasks);

// array to store tasks
const tasks = require('./seedData.json')

// generate a unique ID for each tasks
let id = tasks.length

// create a new tasks
app.post('/tasks', (req, res) => {
  const { name, instructions } = req.body

  // basic validation
  if (!name || !instructions) {
    return res
      .status(400)
      .json({ error: 'name and instructions are required fields' })
  }

  const tasks = {
    id: ++id,
    name,
    instructions
  }

  tasks.push(tasks)
  res.status(201).json(tasks)
})

// get all tasks
app.get('/tasks', (req, res) => {
  const { name } = req.query

  if (name) {
    const filteredtasks = tasks.filter(
      tasks => tasks.name.toLowerCase() === name.toLowerCase()
    )
    return res.json(filteredtasks)
  }

  res.json(tasks)
})
// get a snippet by ID
app.get('/tasks/:id', (req, res) => {
  const tasksId = parseInt(req.params.id)
  const tasks = tasks.find(tasks => tasks.id === tasksId)

  if (!tasks) {
    return res.status(404).json({ error: 'tasks not found' })
  }

  res.json(tasks)
})
// start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})