// src/controllers/auth.controller.js

const authService = require('../services/auth.service')

exports.signup = async (req, res) => {
  try {
    const result = await authService.signupUser(req.body)
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body)
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}