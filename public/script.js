let roomUniqueId = null;
console.log('script.js loaded');
const socket = io();

function createGame() {
    socket.emit("createGame");
  }

  function joinGame() {
    roomUniqueId = document.getElementById('roomUniqueId').value;
    socket.emit('joinGame', {roomUniqueId: roomUniqueId});
}


socket.on("newGame", (data) => {
    console.log("newGame");
    roomUniqueId = data.roomUniqueId;
    document.getElementById("initial").style.display = "none";
    document.getElementById("gamePlay").style.display = "block";
    let copyButton = document.createElement("button");
    copyButton.style.display = "block";
    copyButton.innerText = "Copy Code";
    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(roomUniqueId).then(
        function () {
          console.log("Async: Copying to clipboard was successful!");
        },
        function (err) {
          console.error("Async: Could not copy text: ", err);
        }
      );
    });
    document.getElementById(
      "waitingArea"
    ).innerHTML = `Waiting for opponent, please share code ${roomUniqueId} to join`;
    document.getElementById("waitingArea").appendChild(copyButton);
  });
  
  socket.on("playersConnected", (data) => {
    document.getElementById("waitingArea").style.display = "none";
    document.getElementById('gameArea').style.display = 'block';
  });
  
  
  