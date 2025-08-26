const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gravity = 0.6;
const jumpStrength = -12;
const dashPower = 18;

let player, obstacles, bananas, gameSpeed, score, lives, bestScore;
let gameLoop, isGameOver = false;

function resetGame() {
  player = {
    x: 80, y: canvas.height - 120,
    w: 60, h: 60,
    dy: 0,
    jumping: false,
    dashing: false,
    dashTimer: 0
  };
  obstacles = [];
  bananas = [];
  gameSpeed = 5;
  score = 0;
  lives = 3;
  isGameOver = false;
  document.getElementById("lives").textContent = "❤".repeat(lives);
  document.getElementById("score").textContent = "🍌 " + score;
  document.getElementById("speed").textContent = "Velocidade x1.0";
}

function drawPlayer() {
  ctx.fillStyle = "#ffd84d";
  ctx.beginPath();
  ctx.arc(player.x + player.w/2, player.y + player.h/2, player.w/2, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(player.x+20, player.y+20, 12, 0, Math.PI*2);
  ctx.arc(player.x+40, player.y+20, 12, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(player.x+20, player.y+20, 6, 0, Math.PI*2);
  ctx.arc(player.x+40, player.y+20, 6, 0, Math.PI*2);
  ctx.fill();
}

function drawObstacles() {
  ctx.fillStyle = "#ff6b6b";
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
}

function drawBananas() {
  ctx.fillStyle = "#ffe135";
  bananas.forEach(b => {
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, 10, 20, Math.PI/4, 0, Math.PI*2);
    ctx.fill();
  });
}

function update() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Player physics
  player.y += player.dy;
  if (!player.dashing) player.dy += gravity;

  if (player.y + player.h > canvas.height - 20) {
    player.y = canvas.height - player.h - 20;
    player.jumping = false;
  }

  if (player.dashing) {
    player.dashTimer--;
    if (player.dashTimer <= 0) player.dashing = false;
  }

  // Obstacles
  if (Math.random() < 0.02) {
    obstacles.push({x: canvas.width, y: canvas.height-70, w:50, h:50});
  }
  obstacles.forEach(o => o.x -= gameSpeed);
  obstacles = obstacles.filter(o => o.x+o.w > 0);

  // Bananas
  if (Math.random() < 0.015) {
    bananas.push({x: canvas.width, y: canvas.height-120 - Math.random()*200});
  }
  bananas.forEach(b => b.x -= gameSpeed);
  bananas = bananas.filter(b => b.x > 0);

  // Collision detection
  obstacles.forEach((o, i) => {
    if (player.x < o.x+o.w && player.x+player.w > o.x &&
        player.y < o.y+o.h && player.y+player.h > o.y) {
      if (player.dashing) {
        obstacles.splice(i,1);
      } else {
        lives--;
        document.getElementById("lives").textContent = "❤".repeat(lives);
        obstacles.splice(i,1);
        if (lives <= 0) endGame();
      }
    }
  });

  bananas.forEach((b, i) => {
    if (player.x < b.x+20 && player.x+player.w > b.x &&
        player.y < b.y+20 && player.y+player.h > b.y) {
      bananas.splice(i,1);
      score++;
      document.getElementById("score").textContent = "🍌 " + score;
      if (score % 5 === 0) {
        gameSpeed += 0.5;
        document.getElementById("speed").textContent = "Velocidade x" + (gameSpeed/5).toFixed(1);
      }
    }
  });

  // Draw
  drawPlayer();
  drawObstacles();
  drawBananas();
}

function jump() {
  if (!player.jumping) {
    player.dy = jumpStrength;
    player.jumping = true;
  }
}

function dash() {
  if (!player.dashing) {
    player.dashing = true;
    player.dashTimer = 15;
    player.dy = -dashPower/2;
  }
}

function endGame() {
  isGameOver = true;
  clearInterval(gameLoop);
  document.getElementById("screen-gameover").classList.add("show");
  document.getElementById("finalScore").textContent = score;
  bestScore = Math.max(bestScore || 0, score);
  document.getElementById("bestScore").textContent = bestScore;
}

// Controls
document.getElementById("btnJump").addEventListener("click", jump);
document.getElementById("btnDash").addEventListener("click", dash);
document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") dash();
});

document.getElementById("btnPlay").addEventListener("click", () => {
  resetGame();
  document.getElementById("screen-start").classList.remove("show");
  gameLoop = setInterval(update, 1000/60);
});

document.getElementById("btnRestart").addEventListener("click", () => {
  resetGame();
  document.getElementById("screen-gameover").classList.remove("show");
  gameLoop = setInterval(update, 1000/60);
});
