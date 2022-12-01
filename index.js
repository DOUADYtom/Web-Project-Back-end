require('dotenv').config();

const express = require('express');
const { logger, logEvents } = require('./middlewares/logs');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const path = require('path');
const mongoose = require('mongoose');
const authRouter = require('./routes/authRouter');
const monumentRouter = require('./routes/monumentRouter');
const reviewRouter = require('./routes/reviewRouter');
const userRouter = require('./routes/userRouter');

const app = express();
const port = process.env.PORT;
const DB_URI = (process.env.DB_USE_ONLINE==="true")?process.env.DB_URI:process.env.DB_URI_LOCAL;

// Middlewares

app.use(logger);
// app.use(cors(corsOptions)); // TODO : uncomment at the end of the project 
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, 'public')));


// Routes

app.use('/auth', authRouter);
app.use('/monument', monumentRouter);
app.use('/review', reviewRouter);
app.use('/user', userRouter);

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
      await mongoose.connect(DB_URI, { useNewUrlParser: true });
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