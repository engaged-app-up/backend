const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())


app.get('/', (req, res) => {
  res.status(200).json({msg: 'Hello World'});
})

const port = 3001
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})