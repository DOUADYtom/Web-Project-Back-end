require('dotenv').config();

const express = require('express');
const { logger } = require('./middlewares/logs');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

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


// Start the api

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})