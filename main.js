// ============================================
// GAME START HANDLER
// ============================================
function setupGameStart() {
    const startBtn = document.getElementById('start-game-btn');
    const homepage = document.getElementById('homepage');
    const gameContainer = document.getElementById('game-container');
    
    if (!startBtn || !homepage || !gameContainer) {
        console.error('Required elements not found for game start');
        return;
    }
    
    startBtn.addEventListener('click', () => {
        homepage.classList.add('fade-out');
        
        setTimeout(() => {
            homepage.style.display = 'none';
            gameContainer.style.display = 'block';
            gameContainer.classList.add('fade-in');
            
            setTimeout(() => {
                if (typeof initializeGame === 'function') initializeGame();
                if (typeof setupEventListeners === 'function') setupEventListeners();
                if (typeof startGameLoop === 'function') startGameLoop();
                console.log('Game started!');
            }, 500);
        }, 1000);
    });
}

// ============================================
// MAIN ENTRY POINT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    setupGameStart();
    
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.style.display = 'none';
    }
    
    console.log('Ready to start game! Press the START GAME button.');
});

// ============================================
// GAME CONFIGURATION
// ============================================
const CONFIG = {
    totalSections: 11,
    playerSpeed: 6,
    sectionWidth: window.innerWidth,
    gameWorld: null,
    playerCanvas: null,
    playerCtx: null,
    currentSection: 0,
    sectionElements: [],
    keys: {},
    isTransitioning: false,
    
    // Sprite animation properties
    sprite: {
        image: new Image(),
        columns: 3,
        rows: 2,
        frameWidth: 128,
        frameHeight: 128,
        currentFrame: 0,
        frameCount: 0,
        frameSpeed: 6,
        direction: 0,
        width: 128,
        height: 128,
        isMoving: false,
        verticalOffset: 0
    }
};

// ============================================
// GAME INITIALIZATION
// ============================================
function initializeGame() {
    // DOM elements
    CONFIG.gameWorld = document.getElementById('game-world');
    CONFIG.playerCanvas = document.getElementById('player-canvas');
    CONFIG.playerCtx = CONFIG.playerCanvas.getContext('2d');
    
    // Set canvas size
    CONFIG.playerCanvas.width = CONFIG.sprite.width;
    CONFIG.playerCanvas.height = CONFIG.sprite.height;
    
    // Load sprite
    CONFIG.sprite.image.src = 'imgs/man.png';
    CONFIG.sprite.image.onload = () => {
        console.log('Sprite loaded successfully');
        drawPlayer();
    };
    CONFIG.sprite.image.onerror = () => {
        console.error('Failed to load sprite');
        CONFIG.playerCtx.fillStyle = '#ff6b6b';
        CONFIG.playerCtx.fillRect(0, 0, CONFIG.sprite.width, CONFIG.sprite.height);
    };
    
    // Initialize game state
    CONFIG.currentSection = 0;
    CONFIG.isTransitioning = false;
    
    // Create game sections
    createGameSections();
    
    // Show initial text box
    
    console.log('Game initialized successfully');
}

// ============================================
// EVENT HANDLERS
// ============================================
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        CONFIG.keys[e.key] = true;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        CONFIG.keys[e.key] = false;
    });
    

    
    // Window resize
    window.addEventListener('resize', () => {
        CONFIG.sectionWidth = window.innerWidth;
        updateGameWorldPosition();
    });
}



// ============================================
// GAME WORLD & SECTIONS
// ============================================
function createGameSections() {
    CONFIG.gameWorld.innerHTML = '';
    CONFIG.sectionElements = [];

    for (let i = 0; i < CONFIG.totalSections; i++) {
        const section = document.createElement('div');
        section.className = `game-section section-${i + 1}`;
        section.dataset.section = i;

        // SECTION 9 VIDEO
        if (i === 7) {
            const video = document.createElement('video');
            video.src = 'imgs/gameMockUp.mp4'; // update path
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;

            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';


            section.appendChild(video);
        }

        if (i === 8) {
            const book = document.createElement('img');
            book.src = 'imgs/bookMockUp.png';
            book.className = 'floating-book';

            section.appendChild(book);
        }

        CONFIG.gameWorld.appendChild(section);
        CONFIG.sectionElements.push(section);
    }
}


// ============================================
// FLOATING BOOK SCRIPT 
// ============================================
let bookFloatTime = 0;

function animateFloatingBook() {
    const book = document.querySelector(
        `.section-11 .floating-book`
    );
    if (!book) return;

    bookFloatTime += 0.02; // speed
    const floatY = Math.sin(bookFloatTime) * 8; // height

    book.style.transform = `
        translate(-80%, ${floatY}px)
    `;
}



// ============================================
// PLAYER CONTROLS & ANIMATION
// ============================================
function startGameLoop() {
    function gameLoop() {
        updatePlayer();
        drawPlayer();
        animateFloatingBook();
        checkSection11Trigger(); // FIXED: Changed from checkSection10Trigger
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
}

function updatePlayer() {
    let moved = false;
    
    if (CONFIG.keys['ArrowLeft'] || CONFIG.keys['a']) {
        movePlayer(-CONFIG.playerSpeed);
        moved = true;
        CONFIG.sprite.direction = 1;
    }
    
    if (CONFIG.keys['ArrowRight'] || CONFIG.keys['d']) {
        movePlayer(CONFIG.playerSpeed);
        moved = true;
        CONFIG.sprite.direction = 0;
    }
    
    if (CONFIG.keys[' ']) {
        CONFIG.playerCanvas.style.bottom = '73px';
        setTimeout(() => {
            CONFIG.playerCanvas.style.bottom = '53px';
        }, 200);
        CONFIG.keys[' '] = false;
    }
    
    if (moved) {
        CONFIG.sprite.isMoving = true;
        CONFIG.sprite.frameCount++;
        if (CONFIG.sprite.frameCount % CONFIG.sprite.frameSpeed === 0) {
            CONFIG.sprite.currentFrame = (CONFIG.sprite.currentFrame + 1) % CONFIG.sprite.columns;
        }
    } else {
        CONFIG.sprite.isMoving = false;
        CONFIG.sprite.currentFrame = 0;
    }
}

function drawPlayer() {
    CONFIG.playerCtx.clearRect(0, 0, CONFIG.sprite.width, CONFIG.sprite.height);
    
    if (CONFIG.sprite.image.complete && CONFIG.sprite.image.naturalWidth > 0) {
        CONFIG.playerCtx.drawImage(
            CONFIG.sprite.image,
            CONFIG.sprite.currentFrame * CONFIG.sprite.frameWidth,
            CONFIG.sprite.direction * CONFIG.sprite.frameHeight,
            CONFIG.sprite.frameWidth,
            CONFIG.sprite.frameHeight,
            0,
            CONFIG.sprite.verticalOffset,
            CONFIG.sprite.width,
            CONFIG.sprite.height
        );
    }
}

// ============================================
// PLAYER MOVEMENT & SECTION TRANSITION
// ============================================
let section11PopupsActive = false; // FIXED: Changed variable name for clarity

function movePlayer(deltaX) {
    if (CONFIG.isTransitioning) return;
    
    const playerRect = CONFIG.playerCanvas.getBoundingClientRect();
    const windowRect = document.getElementById('game-container').getBoundingClientRect();
    let newLeft = parseInt(CONFIG.playerCanvas.style.left) || 100;
    newLeft += deltaX;
    
    const minLeft = 10;
    const maxLeft = windowRect.width - playerRect.width - 10;
    
    // Prevent moving past edges in section 11 if popups are active
    if (CONFIG.currentSection === 10 && section11PopupsActive) { // FIXED: Changed variable name
        if (newLeft < minLeft) newLeft = minLeft;
        if (newLeft > maxLeft) newLeft = maxLeft;
    } else {
        // Normal behavior for other sections
        if (newLeft < minLeft) {
            newLeft = minLeft;
            if (deltaX < 0 && CONFIG.currentSection > 0) {
                triggerSectionTransition(-1);
                return;
            }
        }
        
        if (newLeft > maxLeft) {
            newLeft = maxLeft;
            if (deltaX > 0 && CONFIG.currentSection < CONFIG.totalSections - 1) {
                triggerSectionTransition(1);
                return;
            }
        }
    }
    
    CONFIG.playerCanvas.style.left = `${newLeft}px`;
}

function triggerSectionTransition(direction) {
    if (CONFIG.isTransitioning) return;
    
    const newSection = CONFIG.currentSection + direction;
    if (newSection < 0 || newSection >= CONFIG.totalSections) return;
    
    console.log(`Transitioning from section ${CONFIG.currentSection} to ${newSection}`);
    
    CONFIG.isTransitioning = true;
    CONFIG.currentSection = newSection;
    
    updateGameWorldPosition();
    
    const windowRect = document.getElementById('game-container').getBoundingClientRect();
    const playerRect = CONFIG.playerCanvas.getBoundingClientRect();
    
    if (direction > 0) {
        CONFIG.playerCanvas.style.left = '10px';
    } else {
        CONFIG.playerCanvas.style.left = `${windowRect.width - playerRect.width - 20}px`;
    }
    
    setTimeout(() => { CONFIG.isTransitioning = false; }, 300);
}

function updateGameWorldPosition() {
    const translateX = -CONFIG.currentSection * CONFIG.sectionWidth;
    CONFIG.gameWorld.style.transform = `translateX(${translateX}px)`;
    
    const textBox = document.getElementById('text-box-section1');
    if (textBox) {
        textBox.style.display = CONFIG.currentSection === 0 ? 'block' : 'none';
    }
}

// ============================================
// TEXT BOX & TYPING EFFECT
// ============================================


// ============================================
// SECTION 13 POPUPS - TRIGGERED WHEN PLAYER REACHES END
// ============================================
function checkSection11Trigger() {
    // Check if we're in section 13 (index 12) and popups aren't active yet
    if (CONFIG.currentSection === 10 && !section11PopupsActive) {
        const playerRect = CONFIG.playerCanvas.getBoundingClientRect();
        const windowRect = document.getElementById('game-container').getBoundingClientRect();
        const playerLeft = parseInt(CONFIG.playerCanvas.style.left) || 100;
        const playerRight = playerLeft + playerRect.width;
        const triggerZone = windowRect.width - 100; // Trigger 100px from right edge
        
        // Debug logging
        console.log(`Section 12 check - Player right: ${playerRight}, Trigger zone: ${triggerZone}, Window width: ${windowRect.width}`);
        
        if (playerRight >= triggerZone) {
            console.log("Player reached end of section 12 - triggering popups!");
            section11PopupsActive = true;
            createSection11Popups();
        }
    }
}

function createSection11Popups() {
    console.log("=== Creating 5 popups for section 13 ===");
    
    const sizes = [
        // Original 5
        {w: 300, h: 250},
        {w: 250, h: 200},
        {w: 350, h: 300},
        {w: 200, h: 180},
        {w: 320, h: 280},
        
        // Additional smaller popups
        {w: 280, h: 220},
        {w: 220, h: 180},
        {w: 180, h: 150},
        {w: 260, h: 210},
        {w: 190, h: 160},
        
        // Even smaller ones
        {w: 150, h: 120},
        {w: 170, h: 140},
        {w: 140, h: 110},
        {w: 160, h: 130},
        {w: 130, h: 100}
    ];
    
    sizes.forEach((size, i) => {
        setTimeout(() => {
            const maxLeft = window.innerWidth - size.w - 50;
            const maxTop = window.innerHeight - size.h - 50;
            const left = 30 + Math.random() * Math.max(0, maxLeft - 30);
            const top = 30 + Math.random() * Math.max(0, maxTop - 30);
            
            // Create popup with only class, no inline styling
            const popup = document.createElement('div');
            popup.className = 'section11-popup'; // Changed to match CSS
            
            // Grab bar
            const grabBar = document.createElement('div');
            grabBar.className = 'grab-bar';
            grabBar.textContent = `Popup ${i + 1}`;
            
            // Content area
            const content = document.createElement('div');
            content.className = 'content';
            
            // Image
            const img = document.createElement('img');
            img.src = 'imgs/Ascii_mushroomCloud.png';
            img.alt = 'ASCII Mushroom Cloud';
            
            // Handle image error
            img.onerror = () => {
                content.innerHTML = '<div>Image not found</div>';
            };
            
            // Assemble
            content.appendChild(img);
            popup.appendChild(grabBar);
            popup.appendChild(content);
            
            // Position the popup
            popup.style.position = 'absolute';
            popup.style.left = left + 'px';
            popup.style.top = top + 'px';
            popup.style.width = size.w + 'px';
            popup.style.height = size.h + 'px';
            
            // Add to game window
            const windowContent = document.getElementById('game-container');
            if (windowContent) {
                windowContent.appendChild(popup);
            }
            
            // Make draggable
            makeDraggable(popup, grabBar);
        }, i * 500);
    });
}

function makeDraggable(popup, grabBar) {
    let isDragging = false;
    let offsetX, offsetY;
    
    grabBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - popup.offsetLeft;
        offsetY = e.clientY - popup.offsetTop;
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;
        
        const maxLeft = window.innerWidth - popup.offsetWidth - 10;
        const maxTop = window.innerHeight - popup.offsetHeight - 10;
        
        newLeft = Math.max(10, Math.min(newLeft, maxLeft));
        newTop = Math.max(10, Math.min(newTop, maxTop));
        
        popup.style.left = newLeft + 'px';
        popup.style.top = newTop + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}