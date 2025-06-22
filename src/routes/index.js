const register = require('./register')
const login = require('./login')
const ticket = require('./ticket')
const discount = require('./discount')
const schedule = require('./schedule')
function routes(app) {
  app.use('/login', login);
  app.use('/register', register);
  app.use('/ticket', ticket);
  app.use('/discount', discount)
  app.use('/schedule', schedule)
}

module.exports = routes;