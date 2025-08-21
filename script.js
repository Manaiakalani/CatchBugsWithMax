// Game variables
let score = 0;
let bugs = [];
let character;
let gameArea;
let isSwinging = false;
let gameEnded = false;
let currentStreak = 0;
let bestStreak = 0;
let startTime = Date.now();
let gameStartTime = Date.now();
let totalBugsCaught = 0;
let hourlyStats = {};

// Power-up system
let activePowerUps = {
    goldenNet: { active: false, endTime: 0 },
    magnet: { active: false, endTime: 0 },
    shield: { active: false, uses: 0 }
};

// Bug types with rarity and points
const bugRarities = {
    common: { emojis: ['🐛', '🦗', '🐜', '🐞', '🕷️'], points: 1, weight: 70 },
    rare: { emojis: ['🦋', '🐝', '🦂', '🐢'], points: 5, weight: 25 },
    ultraRare: { emojis: ['🦄', '🐲', '🦚', '🐳'], points: 10, weight: 4 },
    secret: { emojis: ['✨', '💎', '🌟'], points: 50, weight: 1 }
};

// Bug rarity weights for random selection
const bugRarityWeights = {
    ultraRare: 1,
    rare: 8,
    common: 91
};

// Game statistics
let gameStats = {
    gamesPlayed: 0,
    totalBugsCaught: 0,
    highestScore: 0,
    longestStreak: 0,
    rareBugsCaught: 0,
    ultraRareBugsCaught: 0,
    totalPlayTime: 0,
    powerUps: {
        goldenNetActive: false,
        goldenNetTime: 0,
        magnetActive: false,
        magnetTime: 0,
        shieldActive: false,
        shieldTime: 0
    }
};

// Power-up types
const powerUpTypes = ['🥇', '🧲', '🛡️'];

// Konami code sequence
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up, Up, Down, Down, Left, Right, Left, Right, B, A
let konamiSequence = [];
let konamiActive = false;

// Bomb appears randomly (much rarer than bugs)
const bombEmoji = '💣';

// Dark mode detection
let isDarkMode = document.body.classList.contains('dark-mode');

// Initialize the game
function init() {
    character = document.getElementById('character');
    gameArea = document.getElementById('gameArea');
    
    // Reset game start time
    gameStartTime = Date.now();
    
    // Load saved statistics
    loadStatistics();
    
    // Create background elements
    createBackgroundElements();
    
    // Set up event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
    
    // Start spawning bugs regularly
    setInterval(() => {
        if (!gameEnded) {
            createBug();
        }
    }, 2500);
    
    // Occasionally spawn bombs (more frequent for chaos!)
    setInterval(() => {
        if (!gameEnded && Math.random() < 0.6) { // 60% chance every 4 seconds
            createBomb();
        }
    }, 4000);
    
    // Spawn power-ups occasionally
    setInterval(() => {
        if (!gameEnded && Math.random() < 0.3) { // 30% chance every 10 seconds
            createPowerUp();
        }
    }, 10000);
    
    // Spawn fireflies in dark mode
    setInterval(() => {
        if (!gameEnded && document.body.classList.contains('dark-mode')) {
            createFirefly();
        }
    }, 3000);
    
    // Spawn falling leaves occasionally
    setInterval(() => {
        if (!gameEnded) {
            createFallingLeaf();
        }
    }, 5000);
}

function loadStatistics() {
    const saved = localStorage.getItem('catchingBugsStats');
    if (saved) {
        try {
            const savedStats = JSON.parse(saved);
            gameStats = { ...gameStats, ...savedStats };
        } catch (e) {
            console.log('Error loading statistics:', e);
        }
    }
}

function createBackgroundElements() {
    if (!gameArea) return;
    
    // Create trees with responsive positioning (more spacing between them)
    const trees = ['🌲', '🌳', '🌴', '🎋', '🍃'];
    const treeCount = Math.max(3, Math.floor(window.innerWidth / 250)); // More spacing between trees
    
    for (let i = 0; i < treeCount; i++) {
        const tree = document.createElement('div');
        tree.className = 'tree';
        tree.textContent = trees[Math.floor(Math.random() * trees.length)];
        // Evenly space trees with some random offset for natural look
        const basePosition = (i / (treeCount - 1)) * 90 + 5; // Between 5% and 95%
        const randomOffset = (Math.random() - 0.5) * 10; // Small random variation
        tree.style.left = Math.min(95, Math.max(5, basePosition + randomOffset)) + '%';
        tree.style.animationDelay = Math.random() * 2 + 's';
        gameArea.appendChild(tree);
    }
    
    // Create flowers with responsive positioning (evenly spaced)
    const flowers = ['🌸', '🌺', '🌻', '🌷', '💐', '🌹', '🌼', '🥀', '💮'];
    const flowerCount = Math.max(6, Math.floor(window.innerWidth / 150)); // More spacing between flowers
    
    for (let i = 0; i < flowerCount; i++) {
        const flower = document.createElement('div');
        flower.className = 'flower';
        flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];
        // Evenly space flowers with some random offset for natural look
        const basePosition = (i / (flowerCount - 1)) * 90 + 5;
        const randomOffset = (Math.random() - 0.5) * 8; // Small random variation
        flower.style.left = Math.min(95, Math.max(5, basePosition + randomOffset)) + '%';
        flower.style.animationDelay = Math.random() * 3 + 's';
        gameArea.appendChild(flower);
    }
    
    // Continuously spawn clouds
    setInterval(() => {
        if (!gameEnded) createCloud();
    }, 8000);
}

function createCloud() {
    if (gameEnded) return;
    
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    
    // Cloud styling with 3D puffy effect using multiple text shadows and emoji sizing
    const baseSize = Math.random() * 30 + 40; // 40-70px base size
    const leftPuff = Math.random() * 20 + baseSize * 0.8; // Left puff variation
    const rightPuff = Math.random() * 20 + baseSize * 0.7; // Right puff variation
    
    cloud.innerHTML = '☁️';
    cloud.style.fontSize = baseSize + 'px';
    cloud.style.left = '-100px';
    cloud.style.top = Math.random() * 30 + 10 + '%';
    
    // Create dynamic CSS for the specific cloud
    const style = document.createElement('style');
    style.textContent = `
        .cloud:nth-last-child(1)::before {
            content: '☁️';
            position: absolute;
            left: -${leftPuff * 0.3}px;
            top: -${leftPuff * 0.1}px;
            font-size: ${leftPuff}px;
            opacity: 0.8;
            z-index: -1;
        }
        .cloud:nth-last-child(1)::after {
            content: '☁️';
            position: absolute;
            width: var(--right-puff-size);
            height: var(--right-puff-size);
            top: -${rightPuff * 0.2}px;
            right: ${baseSize * 0.1}px;
        }
    `;
    document.head.appendChild(style);
    
    gameArea.appendChild(cloud);
    
    // Remove cloud and style after animation
    setTimeout(() => {
        if (cloud.parentNode) {
            gameArea.removeChild(cloud);
            document.head.removeChild(style);
        }
    }, 25000);
}

function createBug() {
    console.log('createBug called, gameEnded:', gameEnded);
    if (gameEnded) return;
    
    const bug = document.createElement('div');
    bug.className = 'bug';
    bug.isBomb = false;
    
    // Determine bug rarity based on weighted random selection
    const rarity = getBugRarity();
    const rarityData = bugRarities[rarity];
    console.log('Creating bug with rarity:', rarity, rarityData);
    
    bug.textContent = rarityData.emojis[Math.floor(Math.random() * rarityData.emojis.length)];
    bug.rarity = rarity;
    bug.points = rarityData.points;
    
    // Add rarity class for special styling
    if (rarity !== 'common') {
        bug.classList.add(rarity === 'ultraRare' ? 'ultra-rare' : rarity);
    }
    
    setupBugMovement(bug);
    
    // Add hover handler for accessibility
    bug.addEventListener('mouseenter', () => {
        if (!gameEnded) catchBug(bug);
    });
}

function getBugRarity() {
    const random = Math.random() * 100;
    
    if (gameStats.powerUps.magnetActive) {
        // Magnet power-up increases rare bug spawn rate
        if (random < bugRarityWeights.ultraRare * 2) return 'ultraRare';
        if (random < bugRarityWeights.rare * 1.5) return 'rare';
    } else {
        if (random < bugRarityWeights.ultraRare) return 'ultraRare';
        if (random < bugRarityWeights.rare) return 'rare';
    }
    
    return 'common';
}

function setupBugMovement(bug) {
    // Random starting position (from edges)
    const side = Math.floor(Math.random() * 4);
    let startX, startY, targetX, targetY;
    
    switch(side) {
        case 0: // Top
            startX = Math.random() * window.innerWidth;
            startY = -50;
            targetX = Math.random() * window.innerWidth;
            targetY = window.innerHeight + 50;
            break;
        case 1: // Right
            startX = window.innerWidth + 50;
            startY = Math.random() * window.innerHeight;
            targetX = -50;
            targetY = Math.random() * window.innerHeight;
            break;
        case 2: // Bottom
            startX = Math.random() * window.innerWidth;
            startY = window.innerHeight + 50;
            targetX = Math.random() * window.innerWidth;
            targetY = -50;
            break;
        case 3: // Left
            startX = -50;
            startY = Math.random() * window.innerHeight;
            targetX = window.innerWidth + 50;
            targetY = Math.random() * window.innerHeight;
            break;
    }
    
    bug.style.left = startX + 'px';
    bug.style.top = startY + 'px';
    
    gameArea.appendChild(bug);
    
    // Animate to target position
    const duration = Math.random() * 3000 + 4000; // 4-7 seconds
    bug.style.transition = `all ${duration}ms linear`;
    
    setTimeout(() => {
        bug.style.left = targetX + 'px';
        bug.style.top = targetY + 'px';
    }, 50);
    
    // Remove bug after animation
    setTimeout(() => {
        if (bug.parentNode) bug.remove();
    }, duration + 100);
}

function createPowerUp() {
    if (gameEnded || Math.random() < 0.85) return; // 15% chance
    
    const powerUp = document.createElement('div');
    powerUp.className = 'power-up';
    
    const powerUpType = ['golden-net', 'magnet', 'shield'][Math.floor(Math.random() * 3)];
    powerUp.classList.add(powerUpType);
    
    const icons = {
        'golden-net': '🥇',
        'magnet': '🧲', 
        'shield': '🛡️'
    };
    
    powerUp.textContent = icons[powerUpType];
    powerUp.powerUpType = powerUpType;
    
    // Position randomly
    powerUp.style.left = Math.random() * 90 + '%';
    powerUp.style.top = Math.random() * 80 + '%';
    
    gameArea.appendChild(powerUp);
    
    powerUp.addEventListener('mouseenter', () => {
        if (!gameEnded) activatePowerUp(powerUpType, powerUp);
    });
    
    setTimeout(() => powerUp.remove(), 8000);
}

function activatePowerUp(type, element) {
    element.remove();
    
    switch(type) {
        case 'golden-net':
            gameStats.powerUps.goldenNetActive = true;
            gameStats.powerUps.goldenNetTime = 10;
            showMessage('Golden Net Active! 2x Points!');
            break;
        case 'magnet':
            gameStats.powerUps.magnetActive = true;
            gameStats.powerUps.magnetTime = 15;
            showMessage('Magnet Active! Attracts rare bugs!');
            break;
        case 'shield':
            gameStats.powerUps.shieldActive = true;
            gameStats.powerUps.shieldTime = 12;
            showMessage('Shield Active! Bomb protection!');
            break;
    }
}

function createFirefly() {
    if (gameEnded || !isDarkMode || Math.random() < 0.7) return;
    
    const firefly = document.createElement('div');
    firefly.className = 'firefly';
    firefly.style.left = Math.random() * 100 + '%';
    firefly.style.top = Math.random() * 100 + '%';
    gameArea.appendChild(firefly);
    
    setTimeout(() => firefly.remove(), 15000);
}

function createFallingLeaf() {
    if (gameEnded || Math.random() < 0.8) return;
    
    const leaf = document.createElement('div');
    leaf.className = 'falling-leaf';
    leaf.textContent = ['🍃', '🍂', '🌿'][Math.floor(Math.random() * 3)];
    leaf.style.left = Math.random() * 100 + '%';
    leaf.style.animationDuration = (Math.random() * 3 + 5) + 's';
    gameArea.appendChild(leaf);
    
    setTimeout(() => leaf.remove(), 8000);
}

function createSparkle(x, y, type = 'default') {
    const sparkle = document.createElement('div');
    sparkle.className = `sparkle sparkle-${type}`;
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    gameArea.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 1000);
}

function showMessage(text) {
    const message = document.createElement('div');
    message.className = 'power-up-message';
    message.textContent = text;
    message.style.position = 'fixed';
    message.style.top = '20%';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '20px';
    message.style.fontWeight = 'bold';
    message.style.fontSize = '18px';
    message.style.zIndex = '1000';
    message.style.animation = 'fadeInOut 2s ease-in-out';
    
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
}

function createBomb() {
    if (gameEnded) return;
    
    const bomb = document.createElement('div');
    bomb.className = 'bug bomb'; // Use bug class for movement, add bomb for styling
    bomb.isBomb = true;
    bomb.textContent = bombEmoji;
    
    setupBugMovement(bomb);
    
    // Add hover handler
    bomb.addEventListener('mouseenter', () => {
        if (!gameEnded) catchBomb(bomb);
    });
}

function onMouseMove(event) {
    if (!character || gameEnded) return;
    
    character.style.left = event.clientX + 'px';
    character.style.top = event.clientY + 'px';
}

function onKeyDown(event) {
    // Handle any key interactions if needed in the future
    // Currently using detectKonamiCode for key detection
}

function swingNet() {
    if (!character || gameEnded) return;
    
    isSwinging = true;
    character.classList.add('catching');
    
    setTimeout(() => {
        isSwinging = false;
        if (character) {
            character.classList.remove('catching');
        }
    }, 200);
}

function catchBug(bug) {
    if (gameEnded) return;
    
    // Trigger net swing animation
    swingNet();
    
    if (bug.parentNode) {
        const rect = bug.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate points based on rarity and power-ups
        let points = bug.points || 1;
        if (gameStats.powerUps.goldenNetActive) {
            points *= 2;
        }
        
        // Update score and statistics
        score += points;
        currentStreak++;
        gameStats.totalBugsCaught++;
        
        // Track rarity statistics
        if (bug.rarity === 'rare') {
            gameStats.rareBugsCaught++;
            createSparkle(centerX, centerY, 'blue');
        } else if (bug.rarity === 'ultraRare') {
            gameStats.ultraRareBugsCaught++;
            createSparkle(centerX, centerY, 'rainbow');
        } else {
            createSparkle(centerX, centerY, 'default');
        }
        
        // Update longest streak
        if (currentStreak > gameStats.longestStreak) {
            gameStats.longestStreak = currentStreak;
        }
        
        document.getElementById('score').textContent = score;
        
        // Show catch effect
        showCatchEffect(centerX, centerY, false, points);
        
        gameArea.removeChild(bug);
    }
}

function catchBomb(bomb) {
    if (gameEnded) return;
    
    // Check for shield power-up protection
    if (gameStats.powerUps.shieldActive) {
        showMessage('Shield Protected You!');
        if (bomb.parentNode) {
            bomb.remove();
        }
        return;
    }
    
    // Trigger net swing animation
    swingNet();
    
    // Remove bomb from arrays and DOM
    const index = bugs.indexOf(bomb);
    if (index > -1) {
        bugs.splice(index, 1);
    }
    
    if (bomb.parentNode) {
        const rect = bomb.getBoundingClientRect();
        gameArea.removeChild(bomb);
        
        // Reset streak
        currentStreak = 0;
        
        // Show bomb catch effect
        showCatchEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, true);
        
        // End the game
        setTimeout(() => {
            endGame();
        }, 1000);
    }
}

function showCatchEffect(x, y, isBomb = false, points = 1) {
    const caughtText = document.createElement('div');
    caughtText.className = 'caught-bug';
    
    if (isBomb) {
        caughtText.textContent = '💥 OH NO!';
        caughtText.style.color = '#FF4444';
        caughtText.style.fontSize = '36px';
    } else {
        caughtText.textContent = `+${points} 🐛`;
        if (points > 1) {
            caughtText.style.color = '#FFD700';
            caughtText.style.fontSize = '24px';
        }
    }
    
    caughtText.style.left = x + 'px';
    caughtText.style.top = y + 'px';
    
    gameArea.appendChild(caughtText);
    
    setTimeout(() => {
        if (caughtText.parentNode) {
            gameArea.removeChild(caughtText);
        }
    }, 2000);
}

function endGame() {
    gameEnded = true;
    
    // Update statistics
    gameStats.gamesPlayed++;
    if (score > gameStats.highestScore) {
        gameStats.highestScore = score;
    }
    gameStats.totalPlayTime += Math.floor((Date.now() - gameStartTime) / 1000);
    
    // Save statistics to localStorage
    localStorage.setItem('catchingBugsStats', JSON.stringify(gameStats));
    
    // Hide character
    if (character) {
        character.style.display = 'none';
    }
    
    // Create dramatic game over screen
    const gameOverScreen = document.createElement('div');
    gameOverScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(45deg, #FF0000, #FF4444);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: flashRed 0.5s ease-in-out 3;
        font-family: 'Comic Sans MS', cursive;
        text-align: center;
    `;
    
    gameOverScreen.innerHTML = `
        <div style="background: rgba(0,0,0,0.8); padding: 40px; border-radius: 20px; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
            <h1 style="color: white; font-size: 48px; margin: 0 0 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                🚨 CRITICAL ALERT 🚨
            </h1>
            <h2 style="color: #FFD700; font-size: 32px; margin: 0 0 20px 0;">
                SEV 1 INCIDENT ASSIGNED
            </h2>
            <p style="color: white; font-size: 24px; margin: 0 0 10px 0;">
                Production Bug Escaped to Wild! 🐛💥
            </p>
            <p style="color: #FFB6C1; font-size: 20px; margin: 0 0 20px 0;">
                Final Score: ${score} bugs caught
            </p>
            <button onclick="location.reload()" style="
                background: linear-gradient(45deg, #FF4444, #FF6666);
                color: white;
                border: none;
                padding: 15px 30px;
                font-size: 20px;
                border-radius: 25px;
                cursor: pointer;
                font-family: 'Comic Sans MS', cursive;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                🔄 RESTART DEBUGGING SESSION
            </button>
        </div>
    `;
    
    // Add red flash keyframes to head if not exists
    if (!document.querySelector('#flashRed-keyframes')) {
        const style = document.createElement('style');
        style.id = 'flashRed-keyframes';
        style.textContent = `
            @keyframes flashRed {
                0%, 100% { background: linear-gradient(45deg, #FF0000, #FF4444); }
                50% { background: linear-gradient(45deg, #FF4444, #FF0000); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(gameOverScreen);
}

function updatePowerUps() {
    if (gameStats.powerUps.goldenNetTime > 0) {
        gameStats.powerUps.goldenNetTime--;
        if (gameStats.powerUps.goldenNetTime === 0) {
            gameStats.powerUps.goldenNetActive = false;
        }
    }
    
    if (gameStats.powerUps.magnetTime > 0) {
        gameStats.powerUps.magnetTime--;
        if (gameStats.powerUps.magnetTime === 0) {
            gameStats.powerUps.magnetActive = false;
        }
    }
    
    if (gameStats.powerUps.shieldTime > 0) {
        gameStats.powerUps.shieldTime--;
        if (gameStats.powerUps.shieldTime === 0) {
            gameStats.powerUps.shieldActive = false;
        }
    }
}

function detectKonamiCode(event) {
    konamiSequence.push(event.keyCode);
    if (konamiSequence.length > konamiCode.length) {
        konamiSequence.shift();
    }
    
    if (konamiSequence.length === konamiCode.length && 
        konamiSequence.every((code, index) => code === konamiCode[index])) {
        activateKonamiMode();
        konamiSequence = [];
    }
}

function activateKonamiMode() {
    konamiActive = true;
    document.body.classList.add('konami-mode');
    showMessage('🌈 KONAMI MODE ACTIVATED! 🌈');
    
    setTimeout(() => {
        konamiActive = false;
        document.body.classList.remove('konami-mode');
    }, 30000);
}

function updateStatistics() {
    const stats = document.getElementById('statistics');
    if (stats && stats.style.display !== 'none') {
        stats.innerHTML = `
            <h3>Game Statistics</h3>
            <p>Games Played: ${gameStats.gamesPlayed}</p>
            <p>Total Bugs Caught: ${gameStats.totalBugsCaught}</p>
            <p>Highest Score: ${gameStats.highestScore}</p>
            <p>Best Streak: ${gameStats.longestStreak}</p>
            <p>Rare Bugs Caught: ${gameStats.rareBugsCaught}</p>
            <p>Ultra Rare Bugs: ${gameStats.ultraRareBugsCaught}</p>
            <p>Total Play Time: ${Math.floor(gameStats.totalPlayTime / 60)}m ${gameStats.totalPlayTime % 60}s</p>
        `;
    }
}

function updateBugs() {
    if (gameEnded) return;
    
    // Update power-ups
    updatePowerUps();
    updateStatistics();
}

// Animation loop
function animate() {
    updateBugs();
    requestAnimationFrame(animate);
}

// Initialize menu functionality
function initializeMenu() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const flyoutMenu = document.getElementById('flyout-menu');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    if (!hamburgerMenu || !flyoutMenu || !darkModeToggle) {
        console.error('Menu elements not found:', { hamburgerMenu, flyoutMenu, darkModeToggle });
        return;
    }
    
    // Toggle flyout menu
    hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('active');
        flyoutMenu.classList.toggle('active');
    });
    
    // Dark mode toggle
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        isDarkMode = document.body.classList.contains('dark-mode');
        
        // Save preference
        localStorage.setItem('darkMode', isDarkMode);
        
        // Update toggle text
        darkModeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
    
    // Load saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        isDarkMode = true;
        darkModeToggle.textContent = '☀️ Light Mode';
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!flyoutMenu.contains(e.target) && !hamburgerMenu.contains(e.target)) {
            hamburgerMenu.classList.remove('active');
            flyoutMenu.classList.remove('active');
        }
    });
}

function gameLoop() {
    if (gameEnded) return;
    
    updatePowerUps();
    updateStatistics();
    
    // Update play time
    gameStats.totalPlayTime = Math.floor((Date.now() - gameStartTime) / 1000);
    
    setTimeout(gameLoop, 1000); // Update every second
}

// Add event listeners
document.addEventListener('keydown', detectKonamiCode);

// Add menu functionality for statistics
function initializeStatistics() {
    const statsToggle = document.getElementById('stats-toggle');
    const statisticsPanel = document.getElementById('statistics');
    
    if (statsToggle && statisticsPanel) {
        statsToggle.addEventListener('click', () => {
            const isVisible = statisticsPanel.style.display !== 'none';
            statisticsPanel.style.display = isVisible ? 'none' : 'block';
            updateStatistics();
        });
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    initializeMenu();
    initializeStatistics();
    init();
    animate();
    gameLoop();
});
