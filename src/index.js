const express = require("express");
const path = require("path");
const routes = require("./routes");
const passport = require('passport');
const session = require('express-session');
const bodyParser = require("body-parser");
const cors = require("cors");

require('dotenv').config();
// require('./app/controllers/social/FacebookController')
// require('./app/controllers/social/GoogleController')
const mongoDB = require('./config/db/mongoDB')
const app = express();

// mySQL.connect() 
mongoDB.connect()

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
//--------------------------------------------------------------
// const cookieSession = require('cookie-session')
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: "GET, POST, PUT, DELETE",
  credentials: true,
}));

app.set("views", path.join(__dirname, "resources", "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


routes(app);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT || 3000}`);
});
