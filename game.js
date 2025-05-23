// Game container and canvas setup
const gameContainer = document.getElementById('gameContainer');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const startTitle = document.getElementById('startTitle');
const bestScoreElement = document.getElementById('bestScore');
const finalScoreElement = document.getElementById('finalScore');
const highScoreElement = document.getElementById('highScore');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// Set fixed game dimensions
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Game variables
let bird = {
    x: 150,
    y: GAME_HEIGHT / 2,
    width: 60,
    height: 45,
    gravity: 0.5,
    velocity: 0,
    jump: -12,
    rotation: 0,
    flapSpeed: 0,
    wingState: 0
};

let pipes = [];
let score = 0;
let bestScore = localStorage.getItem('flappyBirdBestScore') || 0;
let gameRunning = false;
let gameStarted = false;
let frameCount = 0;
const pipeWidth = 90;
const pipeGap = 220;
const pipeSpeed = 3;
const pipeFrequency = 80; // Changed from 120 to 80 to make first pipe appear faster

// Update best score display
bestScoreElement.textContent = `Best Score: ${bestScore}`;

// Cloud variables
let clouds = [];
for (let i = 0; i < 5; i++) {
    clouds.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * (GAME_HEIGHT / 3),
        width: 80 + Math.random() * 70,
        speed: 0.5 + Math.random() * 0.7
    });
}

// Draw background with gradient and clouds
function drawBackground() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Sun
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.arc(GAME_WIDTH - 100, 100, 60, 0, Math.PI * 2);
    ctx.fill();
    
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (const cloud of clouds) {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width / 4, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 3, cloud.y - cloud.width / 6, cloud.width / 3.5, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 1.5, cloud.y, cloud.width / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Move clouds
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = GAME_WIDTH + cloud.width;
            cloud.y = Math.random() * (GAME_HEIGHT / 3);
        }
    }
    
    // Ground
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(0, GAME_HEIGHT - 60, GAME_WIDTH, 60);
    
    // Ground details
    ctx.fillStyle = '#7CB342';
    for (let i = 0; i < 20; i++) {
        const x = (i * 100) % GAME_WIDTH;
        const height = 10 + Math.random() * 20;
        ctx.beginPath();
        ctx.moveTo(x, GAME_HEIGHT - 60);
        ctx.quadraticCurveTo(
            x + 50, GAME_HEIGHT - 60 - height,
            x + 100, GAME_HEIGHT - 60
        );
        ctx.fill();
    }
}

// Draw the enhanced bird
function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);
    
    // Body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing animation
    bird.wingState = (bird.wingState + 0.1) % (Math.PI * 2);
    const wingFlap = Math.sin(bird.wingState) * 0.5;
    
    // Left wing
    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.moveTo(-bird.width * 0.3, 0);
    ctx.quadraticCurveTo(
        -bird.width * 0.7, bird.height * 0.3 + wingFlap * 10,
        -bird.width * 0.3, bird.height * 0.6
    );
    ctx.quadraticCurveTo(
        -bird.width * 0.1, bird.height * 0.3,
        -bird.width * 0.3, 0
    );
    ctx.fill();
    
    // Right wing (mirror)
    ctx.beginPath();
    ctx.moveTo(-bird.width * 0.3, 0);
    ctx.quadraticCurveTo(
        -bird.width * 0.7, -bird.height * 0.3 - wingFlap * 10,
        -bird.width * 0.3, -bird.height * 0.6
    );
    ctx.quadraticCurveTo(
        -bird.width * 0.1, -bird.height * 0.3,
        -bird.width * 0.3, 0
    );
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.width * 0.2, -bird.height * 0.1, bird.width * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(bird.width * 0.35, 0);
    ctx.lineTo(bird.width * 0.6, -bird.height * 0.1);
    ctx.lineTo(bird.width * 0.6, bird.height * 0.1);
    ctx.closePath();
    ctx.fill();
    
    // Pupil
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.width * 0.22, -bird.height * 0.12, bird.width * 0.03, 0, Math.PI * 2);
    ctx.fill();
    
    // Tail
    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.moveTo(-bird.width * 0.4, 0);
    ctx.quadraticCurveTo(
        -bird.width * 0.8, bird.height * 0.2,
        -bird.width * 0.5, bird.height * 0.4
    );
    ctx.quadraticCurveTo(
        -bird.width * 0.3, bird.height * 0.2,
        -bird.width * 0.4, 0
    );
    ctx.fill();
    
    ctx.restore();
    
    // Update rotation based on velocity
    bird.rotation = Math.max(-Math.PI/4, Math.min(Math.PI/4, bird.velocity * 0.05));
}

// Create new pipes
function createPipe() {
    const minHeight = 80;
    const maxHeight = GAME_HEIGHT - pipeGap - minHeight - 60; // 60 is ground height
    const height = minHeight + Math.random() * maxHeight;
    
    pipes.push({
        x: GAME_WIDTH,
        topHeight: height,
        bottomY: height + pipeGap,
        passed: false,
        color: `hsl(${Math.random() * 60 + 100}, 70%, 50%)` // Greenish colors
    });
}

// Draw pipes with better design
function drawPipes() {
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        
        // Pipe top
        ctx.fillStyle = pipe.color;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        
        // Pipe bottom
        ctx.fillStyle = pipe.color;
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, GAME_HEIGHT - pipe.bottomY - 60);
        
        // Pipe edges
        ctx.fillStyle = '#388E3C';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
        
        // Pipe details
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let y = 20; y < pipe.topHeight; y += 30) {
            ctx.fillRect(pipe.x + 10, y, pipeWidth - 20, 10);
        }
        for (let y = pipe.bottomY + 20; y < GAME_HEIGHT - 60; y += 30) {
            ctx.fillRect(pipe.x + 10, y, pipeWidth - 20, 10);
        }
        
        // Move pipe
        pipe.x -= pipeSpeed;
        
        // Check score
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = score;
        }
        
        // Remove off-screen pipes
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }
}

// Check collisions
function checkCollision() {
    // Ground collision
    if (bird.y + bird.height/2 > GAME_HEIGHT - 60) {
        return true;
    }
    
    // Ceiling collision
    if (bird.y - bird.height/2 < 0) {
        return true;
    }
    
    // Pipe collisions
    for (const pipe of pipes) {
        if (
            bird.x + bird.width/2 > pipe.x && 
            bird.x - bird.width/2 < pipe.x + pipeWidth
        ) {
            if (
                bird.y - bird.height/2 < pipe.topHeight || 
                bird.y + bird.height/2 > pipe.bottomY
            ) {
                return true;
            }
        }
    }
    
    return false;
}

// Game over function
function gameOver() {
    gameRunning = false;
    gameStarted = false;
    
    // Update best score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBirdBestScore', bestScore);
        bestScoreElement.textContent = `Best Score: ${bestScore}`;
    }
    
    // Show game over screen
    finalScoreElement.textContent = `Score: ${score}`;
    highScoreElement.textContent = `Best: ${bestScore}`;
    gameOverElement.style.display = 'flex';
}

// Start game function
function startGame() {
    startScreen.style.display = 'none';
    gameRunning = true;
    gameStarted = true;
    resetGame();
}

// Reset game
function resetGame() {
    bird.y = GAME_HEIGHT / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    pipes = [];
    score = 0;
    scoreElement.textContent = score;
    gameOverElement.style.display = 'none';
    frameCount = 0;
    // Make first pipe appear faster by reducing frameCount
    frameCount = pipeFrequency - 20; // Start from 20 frames before first pipe appears
    requestAnimationFrame(gameLoop);
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        gameContainer.requestFullscreen().catch(err => {
            alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Handle input
function handleInput(e) {
    if (!gameStarted && (e.code === 'Space' || e.key === 'ArrowUp' || e.type === 'click')) {
        startGame();
        return;
    }
    
    if ((e.code === 'Space' || e.key === 'ArrowUp' || e.type === 'click') && gameRunning) {
        bird.velocity = bird.jump;
    }
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    frameCount++;
    
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw background
    drawBackground();
    
    // Create new pipes
    if (frameCount % pipeFrequency === 0) {
        createPipe();
    }
    
    // Update bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Draw game elements
    drawPipes();
    drawBird();
    
    // Check for collisions
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', handleInput);
canvas.addEventListener('click', handleInput);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
fullscreenBtn.addEventListener('click', toggleFullscreen);

// Initial draw
drawBackground();
drawBird();

// Handle window resize (center the game container)
function handleResize() {
    const scale = Math.min(
        window.innerWidth / (GAME_WIDTH + 40),
        window.innerHeight / (GAME_HEIGHT + 40)
    );
    gameContainer.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', handleResize);

// Initial scaling
handleResize();