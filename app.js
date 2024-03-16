require('dotenv').config() // bring in environment variables
const express = require('express')
const app = express()
const PORT = 4000

app.use(express.json())


// array to store tasks
const tasks = require('./routes/seedData.json')
const routes = require('./routes')

// generate a unique ID for each snippet
let id = tasks.length + 1

// create a new snippet
app.post('/routes/tasks', (req, res) => {
  const { nameTask, instruction } = req.body

  // basic validation
  if (!nameTask || !instruction) {
    return res
      .status(400)
      .json({ error: 'name and instruction are required fields' })
  }

  const task = {
    id: id++,
    nameTask,
    instruction
  }

  tasks.push(task)
  res.status(201).json(task)
})

// get all tasks
app.get('/routes/tasks', (req, res) => {
  const { tasks } = req.query

  if (tasks) {
    const filteredtasks = tasks.filter(
      tasks => tasks.nameTask.toLowerCase() === tasks.toLowerCase()
    )
    return res.json(filteredtasks)
  }

  res.json(tasks)
})

// get a task by ID
app.get('/routes/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id)
  const snippet = tasks.find(tasks => tasks.id === taskId)

  if (!tasks) {
    return res.status(404).json({ error: 'task not found' })
  }

  res.json(tasks)
})

// edit a task by ID
app.put('/routes/tasks/:id', (req, res) => {
  const tasksId = parseInt(req.params.id)
  const {language, code} = req.body
  let foundIndex = -1
  tasks.map((s, index) => {
    if (s.id == tasksId){
      foundIndex = index
    } 
    return s
  })
  if (foundIndex == -1){
    res.status(404).json("error: 'Snippet not found, not able to be updated")
  } else {
    snippets.splice(foundIndex, 1, {
      "id":foundIndex+1,
      "language":language,
      "code":code
    })
  }
  res.status(200).json(`Snippet with id=${tasksId} updated to {language: ${snippets[foundIndex].language}, code: ${snippets[foundIndex].code}}`)
})
//delete a task by ID
app.delete('/routes/tasks/:id', (req, res) => {
  const tasksId = parseInt(req.params.id)
  const {nameTask, instruction} = req.body
  let foundIndex = -1
  snippets.map((s, index) => {
    if (s.id == tasksId){
      foundIndex = index
    } 
    return s
  })
  if (foundIndex == -1){
    res.status(404).json("error: 'Task not found, not able to be deleted")
  } else{
    snippets.splice(foundIndex, 1)
    console.log(tasks)
  }
  res.status(200).json(`Task with id=${tasksId} deleted`)
})

// start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
