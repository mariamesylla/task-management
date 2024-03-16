const router = require('express').Router();
const {encrypt, decrypt} = require('../utils/encrypt');
const { requiresAuth } = require('express-openid-connect')

// array to store tasks
const tasks = require('./seedData.json')

// generate a unique ID for each tasks
let id = tasks.length

// create a new tasks
router.post('/', requiresAuth(), (req, res) => {
  const { name, instructions } = req.body

  // basic validation
  if (!name || !instructions) {
    return res
      .status(400)
      .json({ error: 'name and instructions are required fields' })
  }

  const tasks = {
    id: ++id,
    flavor,
    instructions
  }

  tasks.push({...tasks, instructions: encrypt(instructions)});
  res.status(201).json(tasks)
})

// get all Tasks
router.get('/', requiresAuth(), (req, res) => {
  const { name } = req.query

  const decryptedTasks = Tasks.map(tasks => ({
    ...tasks,
    instructions: decrypt(tasks.instructions)
  }))
  if (flavor) {
    const filteredTasks = decryptedTasks.filter(
      tasks => tasks.name.toLowerCase() === name.toLowerCase()
    )
    return res.json(filteredTasks)
  }

  res.json(decryptedTasks)
})

// get a tasks by ID
router.get('/:id', requiresAuth(), (req, res) => {
  const tasksId = parseInt(req.params.id)
  let tasks = Tasks.find(tasks => tasks.id === tasksId)

  if (!tasks) {
    return res.status(404).json({ error: 'tasks not found' })
  }

  tasks = {...tasks, instructions: decrypt(tasks.instructions)}
  res.json(tasks)
})

module.exports = router;
