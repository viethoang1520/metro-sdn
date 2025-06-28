const authenticateJWT = require('../middleware/AuthenticateJWT')
const register = require('./register');
const login = require('./login');
const purchase = require('./purchase');
const station = require('./station');
const ticket = require('./ticket');
const discount = require('./discount');
const schedule = require('./schedule'); 
const payment = require('./payment'); 
const admin = require('./admin');
const user = require('./user')

function routes(app) {
    app.use('/login', login);
    app.use('/register', register);
    app.use('/purchase', purchase);
    app.use('/station', station);
    app.use('/ticket', ticket);
    app.use('/discount', authenticateJWT, discount);
    app.use('/schedule', schedule); 
    app.use('/payment', payment); 
    app.use('/admin', admin);
    app.use('/user', user)
}

module.exports = routes;
