const express = require('express');
const cors = require('cors');
const app = express();
const Sentry = require('@sentry/node');
// dotenv required to use environment variables
require('dotenv').config();

// Sentry 
Sentry.init({dsn: "https://3609947d29744121845b0f85c5a23100@o1368148.ingest.sentry.io/6670539"});
app.use(Sentry.Handlers.requestHandler());

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res, next) => {
    // throw new Error('testing sentry');
    res.status(200).json({msg: 'Hello world from Engaged!'});
})

app.post('/', (req, res, next) => {
  res.status(200).json({requestBody: req.body.message})
})

app.use((req, res, next) => {
  // middleware for unsupported routes
  res.status(404).json({msg: 'Route Not Found!'})
})

app.use(Sentry.Handlers.errorHandler());

const port = 3001
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})