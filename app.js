require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 4000;

app.use(express.json());

const tasks = require('./routes/seedData.json');
const routes = require('./routes');

app.use(express.json());

// Use routes
app.use('/tasks', routes.tasks);
app.use('/user', routes.user);

// array to store tasks
let id = tasks.length + 1;

// Create a task (sign up)
app.post('/tasks', (req, res) => {
  const { nameTask, instruction } = req.body;

  if (!nameTask || !instruction) {
    return res.status(400).json({ error: 'Name and instruction are required fields' });
  }

  const task = {
    id: id++,
    nameTask,
    instruction
  };

  tasks.push(task);
  res.status(201).json(task);
});

// Get all tasks
app.get('/tasks', (req, res) => {
  const { nameTask } = req.query;

  if (nameTask) {
    const filteredTasks = tasks.filter(task => task.nameTask.toLowerCase() === nameTask.toLowerCase());
    return res.json(filteredTasks);
  }

  res.json(tasks);
});

// Get a task by id
app.get('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

// Update a task
app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { nameTask, instruction } = req.body;
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with id=${taskId} not found, cannot be updated` });
  }

  tasks[taskIndex] = { id: taskId, nameTask, instruction };
  res.status(200).json({ message: `Task with id=${taskId} updated`, task: tasks[taskIndex] });
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with id=${taskId} not found, cannot be deleted` });
  }

  tasks.splice(taskIndex, 1);
  res.status(200).json({ message: `Task with id=${taskId} deleted` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
