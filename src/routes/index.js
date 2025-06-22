const register = require('./register')
const login = require('./login')
<<<<<<< HEAD
const schedule = require('./schedule')

function routes(app) {
  app.use('/login', login);
  app.use('/register', register);
  app.use('/schedule', schedule)
=======
const ticket = require('./ticket')
const discount = require('./discount')
function routes(app) {
  app.use('/login', login);
  app.use('/register', register);
  app.use('/ticket', ticket);
  app.use('/discount', discount)
>>>>>>> 65fbe3891c825613ea662e563fb18f74cf29d2db
}

module.exports = routes;