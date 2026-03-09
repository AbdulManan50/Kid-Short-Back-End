// src/services/auth.service.js

const bcrypt = require('bcrypt')
const client = require('../config/sanity')
const generateToken = require('../utils/generateToken')

exports.signupUser = async ({ username, email, password }) => {

  const existingUser = await client.fetch(
    '*[_type == "user" && email == $email]',
    { email }
  )

  if (existingUser.length > 0) {
    throw new Error('User already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await client.create({
    _type: 'user',
    username,
    email,
    password: hashedPassword
  })

  return { message: 'User created', user }
}

exports.loginUser = async ({ email, password }) => {

  const users = await client.fetch(
    '*[_type == "user" && email == $email]',
    { email }
  )

  if (users.length === 0) {
    throw new Error('User not found')
  }

  const user = users[0]

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Invalid credentials')
  }

  const token = generateToken(user._id)

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  }
}