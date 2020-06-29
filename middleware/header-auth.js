const HttpError = require('models/http-error')
const apiKey = process.env.API_KEY

const requestHeaderAuth = (req, res, next) => {
  var token = req.header('X-Node-Challenge-Key')

  if (token === apiKey) {
    next()
  } else {
    const error = new HttpError('Invalid key', 401)
    return next(error)
  }
}

module.exports = requestHeaderAuth
