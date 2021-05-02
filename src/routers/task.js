const express = require('express')
const router = new express.Router()
const Task = require('../models/Task')

// Tasks
router.post('/tasks', async (req, res) => {
    const task = new Task(req.body)

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findById(_id)
        if(!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks', async (req, res) => {

    try {
        const tasks = await Task.find({})
        res.status(200).send(tasks)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((field) => allowedUpdates.includes(field))

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid Task field!'})
    }

    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(404).send(error)
    }
})

router.delete('/tasks/:id', async (req, res) => {

    try {
        const task = await Task.findByIdAndDelete(req.params.id)

        if(!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(404).send(error)
    }
})

module.exports = router