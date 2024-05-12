let roomUniqueId = null;
console.log('script.js loaded');
const socket = io();

let player1 = false;


function createGame() {
  player1 = true;
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
    document.getElementById("initial").style.display = "none";
    document.getElementById("waitingArea").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
  });
  
  
  
  function sendChoice(rpsValue) {
    const choiceEvent = player1 ? "p1Choice" : "p2Choice";
    socket.emit(choiceEvent, {
      rpsValue: rpsValue,
      roomUniqueId: roomUniqueId,
    });
    let playerChoiceButton = document.createElement("button");
    playerChoiceButton.style.display = "block";
    playerChoiceButton.classList.add(rpsValue.toString().toLowerCase());
    playerChoiceButton.innerText = rpsValue;
    document.getElementById("player1Choice").innerHTML = "";
    document.getElementById("player1Choice").appendChild(playerChoiceButton);
  }
  function createOpponentChoiceButton(data) {
    document.getElementById('opponentState').innerHTML = "Opponent made a choice";
    let opponentButton = document.createElement('button');
    opponentButton.id = 'opponentButton';
    opponentButton.classList.add(data.rpsValue.toString().toLowerCase());
    opponentButton.style.display = 'none';
    opponentButton.innerText = data.rpsValue;
    document.getElementById('player2Choice').appendChild(opponentButton);
}

  socket.on("p1Choice",(data)=>{
    if(!player1) {
        createOpponentChoiceButton(data);
    }
});


socket.on("p2Choice",(data)=>{
    if(player1) {
        createOpponentChoiceButton(data);
    }
});

socket.on("p1Clicked",(data)=>{
  if(!player1) {
    document.getElementById("player2Choice").innerHTML = '<p id="opponentState">Оппонент натиснув "Продовжити", чи не хочете зіграти ще раз?</p>';
  }
});


socket.on("p2Clicked",(data)=>{
  if(player1) {
    document.getElementById("player2Choice").innerHTML = '<p id="opponentState">Оппонент натиснув "Продовжити", чи не хочете зіграти ще раз?</p>';
  }
});
  

socket.on("result",(data)=>{
  let winnerText = '';
  if(data.winner != 'd') {
      if(data.winner == 'p1' && player1) {
          winnerText = 'You win';
      } else if(data.winner == 'p1') {
          winnerText = 'You lose';
      } else if(data.winner == 'p2' && !player1) {
          winnerText = 'You win';
      } else if(data.winner == 'p2') {
          winnerText = 'You lose';
      }
  } else {
      winnerText = `It's a draw`;
  }
  document.getElementById('opponentState').style.display = 'none';
  document.getElementById('opponentButton').style.display = 'block';
  document.getElementById('winnerArea').innerHTML = winnerText;
  document.getElementById("continueButton").style.display = 'block';
});
function continueGame(){
  document.getElementById("player1Choice").innerHTML = `<button class="rock" onclick="sendChoice('Rock')">Rock</button>
  <button class="paper" onclick="sendChoice('Paper')">Paper</button>
  <button class="scissor" onclick="sendChoice('Scissor')">Scissors</button>`;
  const choiceEvent = player1 ? "p1Clicked" : "p2Clicked";
    socket.emit(choiceEvent, {
      roomUniqueId: roomUniqueId
    });
  document.getElementById("player2Choice").innerHTML = '<p id="opponentState">Чекаємо поки опонент натисне "Продовжити"</p>';
}
socket.on("allPlayersClicked", () => {
  document.getElementById("player2Choice").innerHTML = '<p id="opponentState"></p>';
})