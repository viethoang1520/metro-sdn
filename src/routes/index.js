const register = require('./register')
const login = require('./login')
const ticket = require('./ticket')

function routes(app) {
  app.use('/login', login);
  app.use('/register', register);
  app.use('/ticket', ticket);
}

module.exports = routes;