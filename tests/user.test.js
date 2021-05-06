const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/User')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    await request(app)
        .post('/users')
        .send({
            name: 'Jhon De',
            email: 'jhonde@example.com',
            password: 'johnde123!'
        }).expect(201)
})

test('Should login with existing user details', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        }).expect(200)
})

test('Should not login nonexistent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'example@example.com',
            password: 'example123'
        }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .set('Content-Type', 'application/json')
        .send()
        .expect(200)
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', 'Bearer')
        .set('Content-Type', 'application/json')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg') 
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
                name: 'Ahmet',
                email: 'ahmetd@example.com',
                password: 'johnde123!'
        }).expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Ahmet')
})

test('Should not update invalid user fields', async () => {
    const user = await request(app)
                    .patch('/users/me')
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send({
                        name: 'Ahmet',
                        email: 'ahmetd@example.com',
                        password: 'johnde123!',
                        location: 'Malatya'
                    }).expect(400)
    const updatedUser = await User.findById(userOneId)
    expect(user.body).not.toEqual(updatedUser)
})