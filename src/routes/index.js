const register = require('./register')
const login = require('./login')
const ticket = require('./ticket')
const discount = require('./discount')
function routes(app) {
  app.use('/login', login);
  app.use('/register', register);
  app.use('/ticket', ticket);
  app.use('/discount', discount)
}

module.exports = routes;