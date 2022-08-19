const express = require('express');
const cors = require('cors');
const app = express();
const Sentry = require('@sentry/node');

Sentry.init({dsn: "https://3609947d29744121845b0f85c5a23100@o1368148.ingest.sentry.io/6670539"});
app.use(Sentry.Handlers.requestHandler());

app.use(cors());

app.get('/', (req, res) => {
    // throw new Error('testing sentry');
    res.status(200).json({msg: 'Hello world from Engaged!'});
})

app.use(Sentry.Handlers.errorHandler());

const port = 3001
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})