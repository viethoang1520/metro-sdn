const register = require('./register')
const login = require('./login')
const schedule = require('./schedule')

function routes(app) {
  app.use('/login', login);
  app.use('/register', register);
  app.use('/schedule', schedule)
}

module.exports = routes;