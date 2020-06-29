const express = require('express')

const usersController = require('controllers/users-controller')
const checkHeaderAuth = require('middleware/header-auth')

const router = express.Router()

router.get('/auth/failure', usersController.authFailure)

router.use(checkHeaderAuth)
router.get('/', usersController.getUsers)
router.get('/:uid', usersController.getUserById)
router.post('/signup', usersController.signup)
router.post('/login', usersController.login)

module.exports = router
