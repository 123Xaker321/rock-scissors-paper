const express = require("express");
const app = express();
const http = require('http');
const PORT = "3000";
const path = require('path');
const { Server } = require("socket.io");
const rooms = {};

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("a user is connected");
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    socket.on("createGame", () => {
        const roomUniqueId = makeid(6);
        rooms[roomUniqueId] = {};
        socket.join(roomUniqueId);
        socket.emit("newGame", { roomUniqueId: roomUniqueId });
      });
      socket.on("joinGame", (data) => {
        if (rooms[data.roomUniqueId] != null) {
          socket.join(data.roomUniqueId);
          socket.to(data.roomUniqueId).emit("playersConnected", {});
          socket.emit("playersConnected");
        }
      });
      
  });
  

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '../public/index.html');
});

app.get('/healthcheck', (req, res) => {
    res.send('<h1>RPS App running...</h1>');
});


server.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
});
function makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  