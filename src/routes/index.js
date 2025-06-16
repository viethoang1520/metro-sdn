const register = require('./register')
const login = require('./login')
const purchase = require('./purchase')

function routes(app) {
  app.use('/login', login);
  app.use('/register', register);
  app.use('/purchase', purchase);
}

module.exports = routes;