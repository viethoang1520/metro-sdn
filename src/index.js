const express = require("express");
const path = require("path");
const routes = require("./routes");
const passport = require('passport');
const session = require('express-session');
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require('morgan');

require('dotenv').config();

const mongoDB = require('./config/db/mongoDB')
const app = express();

mongoDB.connect()

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
//--------------------------------------------------------------
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: "GET, POST, PUT, DELETE",
  credentials: true,
}));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

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
