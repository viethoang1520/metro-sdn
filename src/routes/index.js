const register = require('./register')
const login = require('./login')

function routes(app) {
  app.use('/login', login);
  app.use('/register', register);
}

module.exports = routes;