// dotenv required to use environment variables
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const Sentry = require("@sentry/node");
const userRoutes = require("./routes/user-routes");
const roomRoutes = require("./routes/room-routes");
const gameroutes = require('./routes/game-routes');
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

// socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: "https://engaged-4979a.web.app",
    // origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());

// user routes ex: localhost/api/users
app.use("/api/users", userRoutes);

app.use("/api/rooms", roomRoutes);

app.use("/api/game", gameroutes);

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
const roomStateGame = []; //games
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('set_user_id', (data) => {
    socket.userId = data;
    console.log(`Id for ${socket.id}: ${socket.userId}`);
  })

  socket.on("join_room", async (data) => {
    await socket.join(data);
    let activeUsers = await io.in(data).fetchSockets();
    activeUsers = await activeUsers.map(client => {
      return { socketId: client.id, userId: client.userId };
    })
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
    if (activeUsers.length > 0) {
      io.emit('room_set_active', { room: data, count: activeUsers.length });
    }
    io.in(data).emit("get_active_users", activeUsers);
  });

  socket.on("leave_room", async ({ room, isHost }) => {
    socket.leave(room);
    console.log('is host ' + isHost);
    let activeUsers = await io.in(room).fetchSockets();
    activeUsers = await activeUsers.map(client => {
      return { socketId: client.id, userId: client.userId };
    })
    if (activeUsers) {
      io.in(room).emit("get_active_users", activeUsers);
      io.emit('room_set_active', { room: room, count: activeUsers.length });
    }

    if (activeUsers.length == 0) {
      io.emit('room_set_inactive', room);
    }

    if (isHost) {
      io.in(room).emit('set_room_state', false);
    }
  })

  socket.on("is_room_active", async (data) => {
    const room = data;
    let roomInfo = await io.in(room).fetchSockets();
    if (roomInfo.length > 0) {
      io.emit("room_set_active", { room: data, count: roomInfo.length });
      console.log('sent active!')
    }
  })

  socket.on('room_state_change', (data) => {
    if (data.isRoomModeGame) {
      let game = {
        room: data.room,
        hostSocket: socket.id,
        hostUserId: socket.userId
      }
      roomStateGame.push(game);
      console.log(roomStateGame);
    } else {
      roomStateGame.splice(roomStateGame.findIndex(game => {
        return game.hostUserId == socket.userId && game.room == data.room;
      }), 1)
    }
    console.log(data, 'room state change');
    io.in(data.room).emit("set_room_state", data.isRoomModeGame);
  })

  socket.on("get_room_state", (data) => {
    let roomFound = false;
    roomStateGame.forEach(game => {
      if (game.room == data.room) {
        roomFound = true;
      }
    })
    console.log(roomFound)
    io.to(socket.id).emit("set_room_state", roomFound);
  })

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });


  // GAME SOCKET LOGIC

  socket.on('set_game_state', ({ room, gameState }) => {
    io.in(room).emit('set_game_state', gameState);
  })

  socket.on('next_player', ({ room, game }) => {
    io.in(room).emit('set_game_state', game);
  })

  socket.on('next_round', ({ room, game }) => {
    io.in(room).emit('set_game_state', game)
  })

  socket.on('stop_game', (data) => {
    roomStateGame.splice(roomStateGame.findIndex(game => {
      return game.room == data.room;
    }), 1)
    console.log('game in progress list', roomStateGame);
    io.in(data.room).emit('set_game_state', data.game);
  })


  // SOCKET D/C

  socket.on("disconnect", (data) => {
    console.log("User Disconnected", socket.id);
  });
});


