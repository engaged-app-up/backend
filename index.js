// dotenv required to use environment variables
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const Sentry = require("@sentry/node");
const userRoutes = require("./routes/user-routes");
const roomRoutes = require("./routes/room-routes");
const prisma = require("./db/prisma");
const http = require("http");
const server = http.createServer(app);
const admin = require("./util/firebase-admin");
const { getAuth } = require("firebase-admin/auth");

const getUser = async () => {
  //firebase admin sdk is working! getting a user.
  const user = await getAuth().getUserByEmail("imwaynebailey@gmail.com");
  console.log(user.displayName);
};

// getUser();

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

app.use("/api/rooms", roomRoutes);

app.use((req, res, next) => {
  // middleware for unsupported routes
  res.status(404).json({ msg: "Route Not Found!" });
});

//error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode).json({ error: `${err.message}`, statusCode: `${err.statusCode}` });
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

  socket.on('set_user_id', (data) => {
    socket.userId = data;
    console.log(`Id for ${socket.id}: ${socket.userId}`);
  })

  socket.on("join_room", async (data) => {
    socket.join(data);
    let activeUsers = await io.in(data).fetchSockets();
    activeUsers = await activeUsers.map(client => {
      return { socketId: client.id, userId: client.userId };
    })
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
    if (activeUsers.length > 0) {
      io.emit('room_set_active', {room: data, count: activeUsers.length});
    }
    io.in(data).emit("get_active_users", activeUsers);
  });

  socket.on("leave_room", async (data) => {
    socket.leave(data);
    let activeUsers = await io.in(data).fetchSockets();
    activeUsers = await activeUsers.map(client => {
      return { socketId: client.id, userId: client.userId };
    })
    if (activeUsers) {
      io.in(data).emit("get_active_users", activeUsers);
    } 

    if (activeUsers.length == 0) {
      io.emit('room_set_inactive', data);
    }
  })

  socket.on("is_room_active", async (data) => {
    const room = data;
    let roomInfo = await io.in(room).fetchSockets();
    if (roomInfo.length > 0) {
      io.emit("room_set_active", room);
      console.log('sent active!')
    }
  })

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });


  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// console.log(Array.from(io.sockets.sockets).map(socket => socket)); //array of all sockets. 
// const clients = io.sockets.adapter.rooms;
// console.log(clients);
