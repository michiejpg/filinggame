let currentPage = null;
let folder;
let score = 0;
let highScore = 0;

let draggingPage = false;
let offsetX = 0;
let offsetY = 0;

let timeLeft = 60;
let timerStarted = false;

let gameState = "menu";

// Fade controls
let fadeAlpha = 255;
let folderFadeAlpha = 255;
const fadeSpeed = 20; // faster fade
let fadingOut = false;
let fadingIn = false;

function setup() {
  createCanvas(900, 700);
  // Load high score from localStorage
  if (localStorage.getItem("highScore")) {
    highScore = int(localStorage.getItem("highScore"));
  }
}

function draw() {
  background(230);

  if (gameState === "menu") {
    drawStartMenu();
  } else if (gameState === "playing") {
    runGame();
  } else if (gameState === "gameover") {
    drawGameOverMenu();
  }
}

/////////////////////////////
//        GAME LOGIC
/////////////////////////////

function runGame() {
  drawFolder();
  drawHUD();

  // Handle fading transitions
  if (fadingOut) {
    fadeAlpha -= fadeSpeed;
    folderFadeAlpha -= fadeSpeed;
    if (fadeAlpha <= 0) {
      fadeAlpha = 0;
      folderFadeAlpha = 0;
      fadingOut = false;
      generateNewPage();
      fadingIn = true;
    }
  } else if (fadingIn) {
    fadeAlpha += fadeSpeed;
    folderFadeAlpha += fadeSpeed;
    if (fadeAlpha >= 255) {
      fadeAlpha = 255;
      folderFadeAlpha = 255;
      fadingIn = false;
    }
  }

  // Draw page with fade animation
  if (currentPage) {
    push();
    tint(255, fadeAlpha);
    fill(255, fadeAlpha);
    stroke(0, fadeAlpha);
    rect(currentPage.x, currentPage.y, currentPage.w, currentPage.h);
    pop();

    if (draggingPage) {
      currentPage.x = mouseX + offsetX;
      currentPage.y = mouseY + offsetY;
    }
  }

  // Check for successful drop
  if (!mouseIsPressed && draggingPage === false && timerStarted && currentPage) {
    if (!fadingOut && isInFolder(currentPage)) {
      fadeAwayAndScore();
    }
  }

  // Timer countdown
  if (timerStarted && timeLeft > 0) {
    timeLeft -= deltaTime / 1000;
    if (timeLeft < 0) timeLeft = 0;
  }

  if (timeLeft === 0) {
    // Check high score
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
    gameState = "gameover";
  }
}

/////////////////////////////
//      HUD DISPLAY
/////////////////////////////

function drawHUD() {
  fill(0);
  textSize(28);
  textAlign(CENTER, CENTER);

  let cx = width / 2;

  text("Score: " + score, cx - 180, 40);
  text("Time: " + floor(timeLeft), cx, 40);
  text("High Score: " + highScore, cx + 180, 40);
}

/////////////////////////////
//     MOUSE CONTROLS
/////////////////////////////

function mousePressed() {
  if (gameState === "menu") {
    if (buttonClicked(width / 2 - 100, height / 2, 200, 60)) {
      startGame();
    }
  } else if (gameState === "gameover") {
    if (buttonClicked(width / 2 - 120, height / 2 + 40, 240, 60)) {
      startGame();
    }
  } else if (gameState === "playing") {
    if (
      currentPage &&
      mouseX > currentPage.x &&
      mouseX < currentPage.x + currentPage.w &&
      mouseY > currentPage.y &&
      mouseY < currentPage.y + currentPage.h
    ) {
      draggingPage = true;

      if (!timerStarted) timerStarted = true;

      offsetX = currentPage.x - mouseX;
      offsetY = currentPage.y - mouseY;
    }
  }
}

function mouseReleased() {
  draggingPage = false;
}

/////////////////////////////
//       GAME HELPERS
/////////////////////////////

function startGame() {
  gameState = "playing";
  score = 0;

  timeLeft = 60;
  timerStarted = false;

  generateNewPage();
  moveFolderRandom();
  fadeAlpha = 255;
  folderFadeAlpha = 255;
  fadingIn = false;
  fadingOut = false;
}

function generateNewPage() {
  currentPage = {
    x: random(50, width - 150),
    y: random(50, height - 150),
    w: random(70, 120),
    h: random(50, 90)
  };
}

function moveFolderRandom() {
  folder = {
    x: random(100, width - 200),
    y: random(100, height - 150),
    w: 150,
    h: 100
  };
}

function fadeAwayAndScore() {
  score += 100;
  moveFolderRandom();
  fadingOut = true;
}

/////////////////////////////
//         UTILS
/////////////////////////////

function isInFolder(p) {
  return (
    p.x > folder.x &&
    p.x + p.w < folder.x + folder.w &&
    p.y > folder.y &&
    p.y + p.h < folder.y + folder.h
  );
}

function drawFolder() {
  push();
  tint(255, folderFadeAlpha);
  fill(255, 220, 100, folderFadeAlpha);
  rect(folder.x, folder.y, folder.w, folder.h, 10);

  fill(200, 170, 60, folderFadeAlpha);
  rect(folder.x, folder.y - 20, folder.w * 0.6, 30, 5);
  pop();
}

/////////////////////////////
//      MENUS + BUTTONS
/////////////////////////////

function drawStartMenu() {
  fill(0);
  textSize(50);
  textAlign(CENTER, CENTER);
  text("Paper Filing Game", width / 2, height / 3);

  drawButton(width / 2 - 100, height / 2, 200, 60, "PLAY");
}

function drawGameOverMenu() {
  fill(0);
  textSize(50);
  textAlign(CENTER, CENTER);
  text("Time's Up!", width / 2, height / 3);

  textSize(30);
  text("Score: " + score, width / 2, height / 2 - 40);
  text("High Score: " + highScore, width / 2, height / 2);

  drawButton(width / 2 - 120, height / 2 + 80, 240, 60, "PLAY AGAIN");
}

function drawButton(x, y, w, h, label) {
  fill(255);
  stroke(0);
  rect(x, y, w, h, 10);

  fill(0);
  textSize(28);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
}

function buttonClicked(x, y, w, h) {
  return mouseX > x && mouseX < x + w &&
         mouseY > y && mouseY < y + h;
}
