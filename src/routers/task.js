const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/Task')

// Tasks
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if(!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})


// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0
// GET /task?sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const part = req.query.sortBy.split(':')
        sort[part[0]] = part[1] === 'desc' ? -1 : 1
    }

    try {
        // const tasks = await Task.find({ owner: req.user._id })  // Doing same job down below
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((field) => allowedUpdates.includes(field))

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid Task field!'})
    }

    try {

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        updates.forEach((updateField) => task[updateField] = req.body[updateField])

        await task.save()
        
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(404).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {

    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if(!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(404).send(error)
    }
})

module.exports = router