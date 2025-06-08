const mongoose = require('mongoose');

async function connect() {
  try {
    await mongoose.connect('mongodb://localhost:27017/metro');
    console.log('MongoDB has been connected successfully');
  } catch (error) {
    console.log('Connect failed!!!');
  }
}

module.exports = { connect };
