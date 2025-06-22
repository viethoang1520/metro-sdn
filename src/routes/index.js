const register = require('./register');
const login = require('./login');
const purchase = require('./purchase');
const station = require('./station');
const ticket = require('./ticket');
const discount = require('./discount');

function routes(app) {
  app.use('/login', login);
  app.use('/register', register);
  app.use('/purchase', purchase);
  app.use('/station', station);
  app.use('/ticket', ticket);
  app.use('/discount', discount);
}

module.exports = routes;
