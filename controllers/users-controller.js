const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('models/user')
const HttpError = require('models/http-error')

const signup = async (req, res, next) => {
  const { email, password, firstName, lastName, contactNumber } = req.body
  let existingUser

  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again later.', 500)
    return next(error)
  }

  if (existingUser) {
    const error = new HttpError('User exists already, please login instead.', 422)
    return next(error)
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch (err) {
    const error = new HttpError('Could not create user. Please try again', 500)
    return next(error)
  }
  const createdUser = new User({
    firstName,
    lastName,
    name: firstName + ' ' + lastName,
    email,
    contactNumber,
    password: hashedPassword,
  })

  try {
    await createdUser.save()
  } catch (err) {
    const error = new HttpError('Signing up failed. Please try again later.', 500)
    return next(error)
  }

  let token

  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email,
      },
      process.env.JWT_KEY,
      { expiresIn: '24h' }
    )
  } catch (err) {
    const error = new HttpError('Logging in failed, Please try again later.', 500)
    return next(error)
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    name: createdUser.name,
    firstName: createdUser.firstName,
    lastName: createdUser.lastName,
    token: token,
  })
}

const login = async (req, res, next) => {
  const { email, password } = req.body

  let existingUser

  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later', 500)
    return next(error)
  }

  if (!existingUser) {
    const error = new HttpError('Invalid credentials, could not log you in', 403)
    return next(error)
  }

  let isValidPassword = false
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)
  } catch (err) {
    const error = new HttpError('Could not log you in, please check your credentials and try again', 500)
    return next(error)
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid credentials, could not log you in', 403)
    return next(error)
  }

  let token
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY,
      { expiresIn: '24h' }
    )
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later.', 500)
    return next(error)
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName,
    token: token,
  })
}

const getUsers = async (req, res, next) => {
  let users
  try {
    users = await User.find({}, '-password')
  } catch (err) {
    const error = new HttpError('Fetching users failed, please try again later.', 500)
    return next(error)
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) })
}

const getUserById = async (req, res, next) => {
  const userId = req.params.uid

  let user
  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Fetching user failed. Please try again later', 500)
    return next(error)
  }

  if (!user) {
    const error = new HttpError('User not found', 404)
    return next(error)
  }

  res.json({ user: user.toObject({ getters: true }) })
}

const authFailure = async (req, res, next) => {
  const error = new HttpError('Auth failed', 401)
  return next(error)
}

exports.getUsers = getUsers
exports.authFailure = authFailure
exports.signup = signup
exports.login = login
exports.getUserById = getUserById
