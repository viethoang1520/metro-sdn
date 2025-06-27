const mongoose = require('mongoose');

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/metro-sdn');
    console.log('MongoDB has been connected successfully');
  } catch (error) {
    console.log('Connect failed!!!');
  }
}

module.exports = { connect };
