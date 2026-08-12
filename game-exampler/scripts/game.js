const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const btnUp = document.querySelector('#up');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnDown = document.querySelector('#down');
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const pResult = document.querySelector('#result');

const MAP_SIZE = 10;

let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;
let gameFinished = false;

let timeStart;
let timeInterval;

const playerGrid = {
  col: undefined,
  row: undefined,
};
const giftGrid = {
  col: undefined,
  row: undefined,
};
let enemyPositions = [];

window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);

function cellToPixel(index) {
  return elementsSize * (index + 1);
}

function setCanvasSize() {
  if (window.innerHeight > window.innerWidth) {
    canvasSize = window.innerWidth * 0.7;
  } else {
    canvasSize = window.innerHeight * 0.7;
  }

  canvasSize = Number(canvasSize.toFixed(0));

  canvas.setAttribute('width', canvasSize);
  canvas.setAttribute('height', canvasSize);

  elementsSize = canvasSize / MAP_SIZE;

  playerGrid.col = undefined;
  playerGrid.row = undefined;
  startGame();
}

function showEndScreen() {
  game.clearRect(0, 0, canvasSize, canvasSize);
  game.fillStyle = '#1f2933';
  game.textAlign = 'center';
  game.textBaseline = 'middle';
  game.font = elementsSize * 2 + 'px Verdana';
  game.fillText(emojis.WIN, canvasSize / 2, canvasSize / 2 - elementsSize);
  game.font = elementsSize * 1.2 + 'px Verdana';
  game.fillText('FIN', canvasSize / 2, canvasSize / 2 + elementsSize);
}

function startGame() {
  if (gameFinished) {
    showEndScreen();
    return;
  }

  const map = maps[level];

  if (!map) {
    gameWin();
    return;
  }

  if (!timeStart) {
    timeStart = Date.now();
    timeInterval = setInterval(showTime, 100);
    showRecord();
  }

  const mapRows = map.trim().split('\n');
  const mapRowCols = mapRows.map(row => row.trim().split(''));

  showLives();

  enemyPositions = [];
  game.clearRect(0, 0, canvasSize, canvasSize);

  game.font = elementsSize + 'px Verdana';
  game.textAlign = 'end';

  mapRowCols.forEach((row, rowI) => {
    row.forEach((col, colI) => {
      const emoji = emojis[col];
      const posX = cellToPixel(colI);
      const posY = cellToPixel(rowI);

      if (col == 'O') {
        if (playerGrid.col === undefined || playerGrid.row === undefined) {
          playerGrid.col = colI;
          playerGrid.row = rowI;
        }
      } else if (col == 'I') {
        giftGrid.col = colI;
        giftGrid.row = rowI;
      } else if (col == 'X') {
        enemyPositions.push({
          col: colI,
          row: rowI,
        });
      }

      game.fillText(emoji, posX, posY);
    });
  });

  movePlayer();
}

function movePlayer() {
  const giftCollision =
    playerGrid.col === giftGrid.col && playerGrid.row === giftGrid.row;

  if (giftCollision) {
    levelWin();
    return;
  }

  const enemyCollision = enemyPositions.find(enemy => {
    return enemy.col === playerGrid.col && enemy.row === playerGrid.row;
  });

  if (enemyCollision) {
    levelFail();
    return;
  }

  game.fillText(
    emojis['PLAYER'],
    cellToPixel(playerGrid.col),
    cellToPixel(playerGrid.row)
  );
}

function levelWin() {
  level++;
  startGame();
}

function levelFail() {
  lives--;

  if (lives <= 0) {
    level = 0;
    lives = 3;
    gameFinished = false;
    clearInterval(timeInterval);
    timeStart = undefined;
    pResult.innerHTML = '';
  }

  playerGrid.col = undefined;
  playerGrid.row = undefined;
  startGame();
}

function gameWin() {
  if (gameFinished) {
    return;
  }

  gameFinished = true;
  clearInterval(timeInterval);

  const recordTime = Number(localStorage.getItem('record_time'));
  const playerTime = Date.now() - timeStart;

  if (recordTime) {
    if (recordTime >= playerTime) {
      localStorage.setItem('record_time', playerTime);
      pResult.innerHTML = 'SUPERASTE EL RECORD :)';
    } else {
      pResult.innerHTML = 'lo siento, no superaste el record :(';
    }
  } else {
    localStorage.setItem('record_time', playerTime);
    pResult.innerHTML = 'Primera vez? Muy bien, pero ahora trata de superar tu tiempo :)';
  }

  showRecord();
  showEndScreen();
}

function showLives() {
  const heartsArray = Array(lives).fill(emojis['HEART']);

  spanLives.innerHTML = '';
  heartsArray.forEach(heart => spanLives.append(heart));
}

function showTime() {
  spanTime.innerHTML = Date.now() - timeStart;
}

function showRecord() {
  spanRecord.innerHTML = localStorage.getItem('record_time');
}

window.addEventListener('keydown', moveByKeys);
btnUp.addEventListener('click', moveUp);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);
btnDown.addEventListener('click', moveDown);

function moveByKeys(event) {
  if (event.key == 'ArrowUp') moveUp();
  else if (event.key == 'ArrowLeft') moveLeft();
  else if (event.key == 'ArrowRight') moveRight();
  else if (event.key == 'ArrowDown') moveDown();
}

function moveUp() {
  if (gameFinished || playerGrid.row === undefined) {
    return;
  }

  if (playerGrid.row === 0) {
    return;
  }

  playerGrid.row -= 1;
  startGame();
}

function moveLeft() {
  if (gameFinished || playerGrid.col === undefined) {
    return;
  }

  if (playerGrid.col === 0) {
    return;
  }

  playerGrid.col -= 1;
  startGame();
}

function moveRight() {
  if (gameFinished || playerGrid.col === undefined) {
    return;
  }

  if (playerGrid.col >= MAP_SIZE - 1) {
    return;
  }

  playerGrid.col += 1;
  startGame();
}

function moveDown() {
  if (gameFinished || playerGrid.row === undefined) {
    return;
  }

  if (playerGrid.row >= MAP_SIZE - 1) {
    return;
  }

  playerGrid.row += 1;
  startGame();
}
