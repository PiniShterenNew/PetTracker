// Game variables
let canvas, ctx;
let pet = { x: 200, y: 260, width: 40, height: 40, speed: 5 };
let treats = [];
let score = 0;
let gameInterval;
let gameStats = {
  highScore: 0,
  gamesPlayed: 0,
  treatsCaught: 0
};

// Initialize game
function initGame() {
  canvas = document.getElementById('game-canvas');
  if (!canvas) return; // Exit if canvas not found
  
  ctx = canvas.getContext('2d');
  
  // Load saved game stats
  const savedStats = localStorage.getItem('petTrackerGameStats');
  if (savedStats) {
    gameStats = JSON.parse(savedStats);
    updateGameStatsDisplay();
  }
  
  // Set up control buttons
  document.getElementById('game-left').addEventListener('mousedown', () => {
    pet.direction = 'left';
    movePet();
  });
  
  document.getElementById('game-left').addEventListener('mouseup', () => {
    pet.direction = null;
  });
  
  document.getElementById('game-right').addEventListener('mousedown', () => {
    pet.direction = 'right';
    movePet();
  });
  
  document.getElementById('game-right').addEventListener('mouseup', () => {
    pet.direction = null;
  });
  
  // Touch events for mobile
  document.getElementById('game-left').addEventListener('touchstart', (e) => {
    e.preventDefault();
    pet.direction = 'left';
    movePet();
  });
  
  document.getElementById('game-left').addEventListener('touchend', () => {
    pet.direction = null;
  });
  
  document.getElementById('game-right').addEventListener('touchstart', (e) => {
    e.preventDefault();
    pet.direction = 'right';
    movePet();
  });
  
  document.getElementById('game-right').addEventListener('touchend', () => {
    pet.direction = null;
  });
  
  // Start game
  startGame();
}

// Start game
function startGame() {
  // Reset game state
  pet.x = canvas.width / 2 - pet.width / 2;
  treats = [];
  score = 0;
  document.getElementById('game-score').textContent = score;
  
  // Create treat dropping interval
  gameInterval = setInterval(() => {
    // Create new treat
    if (Math.random() < 0.1) {
      createTreat();
    }
    
    // Update and draw game
    updateGame();
    drawGame();
  }, 50);
  
  gameStats.gamesPlayed++;
  updateGameStatsDisplay();
  saveGameStats();
}

// Create a new treat
function createTreat() {
  const treat = {
    x: Math.random() * (canvas.width - 20),
    y: 0,
    width: 20,
    height: 20,
    speed: 2 + Math.random() * 3
  };
  
  treats.push(treat);
}

// Update game state
function updateGame() {
  // Move treats
  for (let i = treats.length - 1; i >= 0; i--) {
    treats[i].y += treats[i].speed;
    
    // Check if treat is off screen
    if (treats[i].y > canvas.height) {
      treats.splice(i, 1);
      continue;
    }
    
    // Check for collision with pet
    if (collision(pet, treats[i])) {
      treats.splice(i, 1);
      score++;
      gameStats.treatsCaught++;
      document.getElementById('game-score').textContent = score;
      
      if (score > gameStats.highScore) {
        gameStats.highScore = score;
      }
      
      updateGameStatsDisplay();
      saveGameStats();
    }
  }
}

// Move pet
function movePet() {
  if (!pet.direction) return;
  
  const moveLoop = () => {
    if (pet.direction === 'left') {
      pet.x = Math.max(0, pet.x - pet.speed);
    } else if (pet.direction === 'right') {
      pet.x = Math.min(canvas.width - pet.width, pet.x + pet.speed);
    }
    
    drawGame();
    
    if (pet.direction) {
      requestAnimationFrame(moveLoop);
    }
  };
  
  requestAnimationFrame(moveLoop);
}

// Draw game
function drawGame() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw pet
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.arc(pet.x + pet.width/2, pet.y, pet.width/2, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw pet face
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(pet.x + pet.width/2 - 8, pet.y - 5, 5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(pet.x + pet.width/2 + 8, pet.y - 5, 5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(pet.x + pet.width/2, pet.y + 5, 8, 0, Math.PI);
  ctx.stroke();
  
  // Draw treats
  ctx.fillStyle = '#FF9800';
  treats.forEach(treat => {
    ctx.beginPath();
    ctx.arc(treat.x + treat.width/2, treat.y + treat.height/2, treat.width/2, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Detect collision between two objects
function collision(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

// Reset game
function resetGame() {
  clearInterval(gameInterval);
  startGame();
}

// Update game stats display
function updateGameStatsDisplay() {
  document.getElementById('high-score').textContent = gameStats.highScore;
  document.getElementById('games-played').textContent = gameStats.gamesPlayed;
  document.getElementById('treats-caught').textContent = gameStats.treatsCaught;
}

// Save game stats
function saveGameStats() {
  localStorage.setItem('petTrackerGameStats', JSON.stringify(gameStats));
}