const register = require('./register')
const login = require('./login')
const discount = require('./discount')
function routes(app) {
  app.use('/login', login);
  app.use('/register', register);
  app.use('/discount', discount)
}

module.exports = routes;