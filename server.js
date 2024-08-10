const mongoose = require('mongoose');
const app = require('./app');

const local_db = process.env.LOCAL_DB;
const port = process.env.PORT || 3000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Connect to local database
mongoose.connect(local_db, {}).then(() => {
  console.log('DB-Connect: Connected to Local Database');
});

//Start app
const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
