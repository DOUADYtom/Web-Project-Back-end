require('dotenv').config();

const express = require('express');
const { logger, logEvents } = require('./middlewares/logs');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT;


// Middlewares

app.use(logger);
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, 'public')));


// Routes

app.get('/', (req, res) => {
  res.send('Hello World !');
})


// Not found ressource

app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
      res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
      res.json({ message: '404 Not Found' });
  } else {
      res.type('txt').send('404 Not Found');
  }
});


// Overwrite error handler

app.use(errorHandler);


// connect to database

const connectDB = async () => {
  try {
      await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });
  } catch (err) {
      console.log(err)
  }
}

connectDB();


// Start the api

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(port, () => console.log(`App listening on port ${port}`));
});

mongoose.connection.on('error', err => {
  console.log(err);
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});