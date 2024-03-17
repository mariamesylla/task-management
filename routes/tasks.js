const route = require('express').Router();
const { encrypt, decrypt } = require('../utils/encrypt');


const tasks = require('./seedData.json');

tasks.forEach(task => {
  task.instruction = encrypt(task.instruction);
});

let id = tasks.length + 1;

route.post('/', (req, res) => {
  const { nameTask, instruction } = req.body;

  if (!nameTask || !instruction) {
    return res.status(400).json({ error: 'Name and instruction are required fields' });
  }

  const task = {
    id: id++,
    nameTask,
    instruction
  };

  tasks.push({...task, instruction : encrypt(instruction)});
  res.status(201).json(task);
});

route.get('/', (req, res) => {
  const { nameTask } = req.query;

  const deinstructiondTasks = tasks.map(task => ({
    ...task,
    instruction: decrypt(task.instruction)
  }));

  if (nameTask) {
    const regex = new RegExp(nameTask, "gi");
    const filteredTasks = deinstructiondTasks.filter(task => task.nameTask.match(regex));
    return res.json(filteredTasks);
  }

  res.json(deinstructiondTasks);
});

route.get('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  let task = tasks.find(task => task.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task = { ...task, instruction: decrypt(task.instruction) };

  res.json(task);
});

route.put('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { nameTask, instruction } = req.body;
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with id=${taskId} not found, cannot be updated` });
  }

  tasks[taskIndex] = { ...tasks[taskIndex], nameTask, instruction: encrypt(instruction) };

  res.status(200).json({ message: `Task with id=${taskId} updated`, task: tasks[taskIndex] });
});

route.delete('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with id=${taskId} not found, cannot be deleted` });
  }

  tasks.splice(taskIndex, 1);

  res.status(200).json({ message: `Task with id=${taskId} deleted` });
});

module.exports = route;
