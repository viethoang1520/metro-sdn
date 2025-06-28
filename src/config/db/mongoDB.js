const mongoose = require('mongoose');

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB has been connected successfully');
  } catch (error) {
    console.log(error.message);
    console.log('Connect failed!!!');
  }
}

module.exports = { connect };
