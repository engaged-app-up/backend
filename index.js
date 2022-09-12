const express = require("express");
const cors = require("cors");
const app = express();
const Sentry = require("@sentry/node");
const userRoutes = require("./routes/user-routes");
const prisma = require("./db/prisma");
const http = require("http");
const server = http.createServer(app);
const admin = require('./util/firebase-admin');
const {getAuth} = require('firebase-admin/auth');

const getUser = async () => {
  //firebase admin sdk is working! getting a user.
  const user = await getAuth().getUserByEmail('imwaynebailey@gmail.com');
  console.log(user.uid);
}

// getUser();



// dotenv required to use environment variables
require("dotenv").config();

// Sentry
Sentry.init({
  dsn: "https://3609947d29744121845b0f85c5a23100@o1368148.ingest.sentry.io/6670539",
});
app.use(Sentry.Handlers.requestHandler());

// Middleware
app.use(cors());
app.use(express.json());

// user routes ex: localhost/api/users
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  // middleware for unsupported routes
  res.status(404).json({ msg: "Route Not Found!" });
});

//error handler
app.use((err, req, res, next) => {
  res.json({ error: `${err.message}`, statusCode: `${err.statusCode}` });
});

app.use(Sentry.Handlers.errorHandler());

prisma
  .$connect()
  .then(() => {
    const port = process.env.PORT || 3001;
    server.listen(port, () => {
      console.log(`Running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

//socket io

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
    console.log(data);
  });
});
