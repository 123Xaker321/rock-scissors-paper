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
      socket.on("p1Choice", (data) => {
        let rpsValue = data.rpsValue;
        rooms[data.roomUniqueId].p1Choice = rpsValue;
        socket.to(data.roomUniqueId).emit("p1Choice", { rpsValue: data.rpsValue });
        if (rooms[data.roomUniqueId].p2Choice != null) {
          declareWinner(data.roomUniqueId);
        }
      });
    
    
      socket.on("p2Choice", (data) => {
        let rpsValue = data.rpsValue;
        rooms[data.roomUniqueId].p2Choice = rpsValue;
        socket.to(data.roomUniqueId).emit("p2Choice", { rpsValue: data.rpsValue });
        if (rooms[data.roomUniqueId].p1Choice != null) {
          declareWinner(data.roomUniqueId);
        }
      });
      function declareWinner(roomUniqueId) {
        let p1Choice = rooms[roomUniqueId].p1Choice;
        let p2Choice = rooms[roomUniqueId].p2Choice;
        let winner = null;
        if (p1Choice === p2Choice) {
            winner = "d";
        } else if (p1Choice == "Paper") {
            if (p2Choice == "Scissor") {
                winner = "p2";
            } else {
                winner = "p1";
            }
        } else if (p1Choice == "Rock") {
            if (p2Choice == "Paper") {
                winner = "p2";
            } else {
                winner = "p1";
            }
        } else if (p1Choice == "Scissor") {
            if (p2Choice == "Rock") {
                winner = "p2";
            } else {
                winner = "p1";
            }
        }
        io.sockets.to(roomUniqueId).emit("result", {
            winner: winner
        });
        rooms[roomUniqueId].p1Choice = null;
        rooms[roomUniqueId].p2Choice = null;
        rooms[roomUniqueId].p1Clicked = null;
        rooms[roomUniqueId].p2Clicked = null;
      }
      socket.on("p1Clicked", (data) => {
        rooms[data.roomUniqueId].p1Clicked = true;
        if (rooms[data.roomUniqueId].p2Clicked != null) {
          socket.emit("allPlayersClicked");
          socket.to(data.roomUniqueId).emit("allPlayersClicked");
        }
        socket.to(data.roomUniqueId).emit("p1Clicked", { rpsValue: true });
        
      });
      socket.on("p2Clicked", (data) => {
        rooms[data.roomUniqueId].p2Clicked = true;
        if (rooms[data.roomUniqueId].p1Clicked != null) {
          socket.emit("allPlayersClicked");
          socket.to(data.roomUniqueId).emit("allPlayersClicked");
        }
        socket.to(data.roomUniqueId).emit("p2Clicked", { rpsValue: true });
        
      });
  });
  

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '../public/index.html');
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
  