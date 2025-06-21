const register = require('./register')
const login = require('./login')
const purchase = require('./purchase')
const station = require('./station')

function routes(app) {
  app.use('/login', login);
  app.use('/register', register);
  app.use('/purchase', purchase);
  app.use('/station', station);
}

module.exports = routes;