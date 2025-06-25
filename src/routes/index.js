<<<<<<< HEAD
const register = require('./register')
const login = require('./login')
const purchase = require('./purchase')
const station = require('./station')
const ticket = require('./ticket')
const discount = require('./discount')
const schedule = require('./schedule')
=======
const register = require('./register');
const login = require('./login');
const purchase = require('./purchase');
const station = require('./station');
const ticket = require('./ticket');
const discount = require('./discount');
const schedule = require('./schedule'); // giữ cái này từ develop

>>>>>>> 273b22e220582a15844c40ca76c0f818a2dfb3ff
function routes(app) {
    app.use('/login', login);
    app.use('/register', register);
    app.use('/purchase', purchase);
    app.use('/station', station);
    app.use('/ticket', ticket);
    app.use('/discount', discount);
    app.use('/schedule', schedule); // dùng ở đây nên cần import bên trên
}

module.exports = routes;
