const route = require('express').Router()
const { encrypt, decrypt } = require('../utils/encrypt')

// array to store tasks
const tasks = require('../seedData.json')

//encrypt each task's code
tasks.map((task, index) => {
  // task.code = encrypt(task.code) (another way to accomplish the same thing!)
  tasks[index] = { ...task, code: encrypt(task.code) }
})

// generate a unique ID for each task
let id = tasks.length + 1

/**
 * Create a task
 */
route.post('/', (req, res) => {
  const { nameTaskuage, code } = req.body

  // basic validation
  if (!nameTaskuage || !code) {
    return res
      .status(400)
      .json({ error: 'Name and instruction are required fields' })
  }

  const task = {
    id: id++,
    nameTask,
    instruction
  }

  // overwrite code with encrypted before storing
  tasks.push({ ...task, code: encrypt(code) })

  // send back the unencrypted task
  res.status(201).json(task)
})

/**
 * Get all tasks
 */
route.get('/', (req, res) => {
  const { nameTask } = req.query

  console.log("encrypted code tasks that are stored", tasks)

  // decrypt all tasks
  const decodedtasks = tasks.map(task => ({
     ...task,
    code: decrypt(task.code)
  }))

  // handle query strings
  // if (nameTask) {
  //   const filteredtasks = decodedtasks.filter(
  //     task => task.nameTaskuage.toLowerCase() === nameTask.toLowerCase()
  //   )
  //   return res.json(filteredtasks)
  // }

   //filter more than exact match
   if (nameTask) {
    const regex = new RegExp(nameTask, "gi")
    const filteredtasks = decodedtasks.filter(
      task => task.nameTaskuage.match(regex)
    )
    return res.json(filteredtasks)
    }

  console.log("decrypted code from get request that will be sent as a response: ", decodedtasks)
  res.json(decodedtasks)
})

/**
 * Get one task
 */
route.get('/:id', (req, res) => {
  const taskId = parseInt(req.params.id)
  let task = tasks.find(task => task.id === taskId)

  console.log("encrypted code task that is stored", task)

  if (!task) {
    return res.status(404).json({ error: 'task not found' })
  }
  // decrypt before sending back
  task = {...task, 'code': decrypt(task.code)}
 
  console.log("decrypted code from get request that will be sent as a response: ", task)

  res.json(task)
})


//STRETCH GOALS

// edit a task by ID
route.put('/:id', (req, res) => {
  const taskId = parseInt(req.params.id)
  const {nameTaskuage, code} = req.body
  let foundIndex = -1
  tasks.map((s, index) => {
    if (s.id == taskId){
      foundIndex = index
    } 
    return s
  })
  if (foundIndex == -1){
    res.status(404).json("error: 'task not found, not able to be updated")
  } else {
    tasks.splice(foundIndex, 1, {
      ...tasks[foundIndex],
      "nameTaskuage": nameTaskuage,
      "code": encrypt(code)
    })
  }

  res.status(200).json(`task with id=${taskId} updated to {nameTaskuage: ${tasks[foundIndex].nameTaskuage}, code: ${tasks[foundIndex].code}}`)
})

//delete a task by ID
route.delete('/:id', (req, res) => {
  const taskId = parseInt(req.params.id)
  const {nameTaskuage, code} = req.body
  let foundIndex = -1
  tasks.map((s, index) => {
    if (s.id == taskId){
      foundIndex = index
    } 
    return s
  })
  if (foundIndex == -1){
    res.status(404).json("error: 'task not found, not able to be deleted")
  } else{
    tasks.splice(foundIndex, 1)
    console.log(tasks)
  }
  res.status(200).json(`task with id=${taskId} deleted`)
})

module.exports = route
