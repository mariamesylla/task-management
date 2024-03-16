require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const { auth } = require('express-openid-connect');

const app = express();
const PORT = process.env.PORT || 4000; // Use environment variable for port, fallback to 4000 if not specified

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET, // Load secret from environment variable
  baseURL: 'http://localhost:4000',
  clientID: process.env.CLIENT_ID, // Load client ID from environment variable
  issuerBaseURL: process.env.ISSUER_BASE_URL // Load issuer base URL from environment variable
};

app.use(express.json());

app.use(auth(config));

app.use('/user', routes.user);
app.use('/tasks', routes.tasks);

// array to store tasks
const tasks = require('./seedData.json');

// generate a unique ID for each task
let taskId = tasks.length;

// create a new task
app.post('/tasks', (req, res) => {
  const { name, instructions } = req.body;

  // basic validation
  if (!name || !instructions) {
    return res
      .status(400)
      .json({ error: 'name and instructions are required fields' });
  }

  const newTask = {
    id: ++taskId,
    name,
    instructions
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// get all tasks
app.get('/tasks', (req, res) => {
  const { name } = req.query;

  if (name) {
    const filteredTasks = tasks.filter(
      task => task.name.toLowerCase() === name.toLowerCase()
    );
    return res.json(filteredTasks);
  }

  res.json(tasks);
});

// get a task by ID
app.get('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'task not found' });
  }

  res.json(task);
});

// start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
