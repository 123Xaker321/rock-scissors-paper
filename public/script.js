let allPlayersClicked = false;
let roomUniqueId = null;
console.log('script.js loaded');
const socket = io();

let player1 = false;


function createGame() {
  document.getElementById("gamePlay").style.display = "block"
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
    document.getElementById("gamePlay").style.display = "flex";
    let copyButton = document.createElement("button");
    copyButton.setAttribute("class", "glow-on-hover")
    copyButton.style.display = "block";
    copyButton.style.margin = "20px 0"
    copyButton.innerText = "Копировать";
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
    ).innerHTML = `Ждем оппонента, пожалуйста поделитесь кодом для присоединения к игре ${roomUniqueId}`;
    document.getElementById("waitingArea").appendChild(copyButton);
  });
  
  socket.on("playersConnected", (data) => {
    document.getElementById("initial").style.display = "none";
    document.getElementById("waitingArea").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    document.getElementById("gamePlay").style.display = "block";
  });
  
  
  
  function sendChoice(rpsValue) {
    const choiceEvent = player1 ? "p1Choice" : "p2Choice";
    socket.emit(choiceEvent, {
      rpsValue: rpsValue,
      roomUniqueId: roomUniqueId,
    });
    let playerChoiceButton = document.createElement("button");
    playerChoiceButton.setAttribute("class", "glow-on-hover")
    playerChoiceButton.style.display = "block";
    playerChoiceButton.classList.add(rpsValue.toString().toLowerCase());
    playerChoiceButton.innerText = rpsValue;
    document.getElementById("player1Choice").innerHTML = "";
    document.getElementById("player1Choice").appendChild(playerChoiceButton);
  }
  function createOpponentChoiceButton(data) {
    document.getElementById('opponentState').innerHTML = "Оппонент сделал свой выбор";
    let opponentButton = document.createElement('button');
    opponentButton.id = 'opponentButton';
    opponentButton.classList.add(data.rpsValue.toString().toLowerCase());
    opponentButton.style.display = 'none';
    opponentButton.innerText = data.rpsValue;
    opponentButton.setAttribute("class", "glow-on-hover")
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
  player1Clicked = true;
  if(!player1 && !allPlayersClicked) {
    document.getElementById("player2Choice").innerHTML = '<p id="opponentState">Оппонент нажал "Продолжить", не хотите сыграть еще раз?</p>';
  }
});


socket.on("p2Clicked",(data)=>{
  player2Clicked = true;
  if(player1 && !allPlayersClicked) {
    document.getElementById("player2Choice").innerHTML = '<p id="opponentState">Оппонент нажал "Продолжить", не хотите сыграть еще раз?</p>';
  }
});
  

socket.on("result",(data)=>{
  document.getElementById("continueButton").style.display = "block";
  allPlayersClicked = false;
  
  let winnerText = '';
  if(data.winner != 'd') {
      if(data.winner == 'p1' && player1) {
          winnerText = 'Вы выиграли';
      } else if(data.winner == 'p1') {
          winnerText = 'Вы проиграли';
      } else if(data.winner == 'p2' && !player1) {
          winnerText = 'Вы выиграли';
      } else if(data.winner == 'p2') {
          winnerText = 'Вы проиграли';
      }
  } else {
      winnerText = `Ничья`;
  }
  document.getElementById('opponentState').style.display = 'none';
  document.getElementById('opponentButton').style.display = 'block';
  document.getElementById('winnerArea').innerHTML = winnerText;
  document.getElementById("continueButton").style.display = 'block';
});
function continueGame(){
  document.getElementById("player1Choice").innerHTML = `<button class="rock glow-on-hover" onclick="sendChoice('Камень')">Камень</button>
  <button class="paper glow-on-hover" onclick="sendChoice('Бумага')">Бумага</button>
  <button class="scissor glow-on-hover" onclick="sendChoice('Ножницы')">Ножницы</button>`;
  const choiceEvent = player1 ? "p1Clicked" : "p2Clicked";
    socket.emit(choiceEvent, {
      roomUniqueId: roomUniqueId
    });
  
  document.getElementById("player2Choice").innerHTML = '<p id="opponentState">Ожидаем пока оппонент нажмет "Продолжить"</p>';
}
socket.on("allPlayersClicked", () => {
  allPlayersClicked = true;
  document.getElementById("player2Choice").innerHTML = '<p id="opponentState"></p>';
  document.getElementById("winnerArea").innerHTML = "";
  document.getElementById("continueButton").style.display = "none";
})