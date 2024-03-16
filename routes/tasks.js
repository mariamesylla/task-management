const router = require('express').Router();
const { encrypt, decrypt } = require('../utils/encrypt');
const { requiresAuth } = require('express-openid-connect');

// Array to store tasks
const tasks = require('./seedData.json');

// Generate a unique ID for each task
let taskId = tasks.length;

// Create a new task
router.post('/', requiresAuth(), (req, res) => {
  const { name, instructions } = req.body;

  // Basic validation
  if (!name || !instructions) {
    return res
      .status(400)
      .json({ error: 'name and instructions are required fields' });
  }

  const newTask = {
    id: ++taskId,
    name,
    instructions: encrypt(instructions) // Encrypt instructions before saving
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Get all tasks
router.get('/', requiresAuth(), (req, res) => {
  const { name } = req.query;

  const decryptedTasks = tasks.map(task => ({
    ...task,
    instructions: decrypt(task.instructions) // Decrypt instructions before sending
  }));

  if (name) {
    const filteredTasks = decryptedTasks.filter(
      task => task.name.toLowerCase() === name.toLowerCase()
    );
    return res.json(filteredTasks);
  }

  res.json(decryptedTasks);
});

// Get a task by ID
router.get('/:id', requiresAuth(), (req, res) => {
  const taskId = parseInt(req.params.id);
  let task = tasks.find(task => task.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Decrypt instructions before sending
  task = { ...task, instructions: decrypt(task.instructions) };
  res.json(task);
});

module.exports = router;
