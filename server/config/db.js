const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://pkdevelopers17:x9jauedVroZ3qUyA@pkdevelopers.w4clrnu.mongodb.net/farukh-lab-results?retryWrites=true&w=majority';

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('Check MongoDB Atlas credentials and database user permissions.');
    } else if (error.message.includes('IP')) {
      console.error('Check MongoDB Atlas Network Access / IP whitelist.');
    }
    console.error('To use local MongoDB, set in .env: MONGODB_URI=mongodb://localhost:27017/farukh-lab-results');
    process.exit(1);
  }
};

module.exports = connectDB;
