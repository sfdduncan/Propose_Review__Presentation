// ============================================
// GAME CONFIGURATION
// ============================================
const CONFIG = {
    totalSections: 10,
    playerSpeed: 5,
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
        direction: 0, // 0 = east, 1 = west
        width: 128,
        height: 128,
        isMoving: false,
        verticalOffset: 0
    },
    
    // Popup configurations
    popups: {
        // Section 2: Video
        section2: {
            id: 'popup-section2',
            autoShow: true,
            autoHide: true
        },
        // Section 3: AI Bias (4 popups)
        section3: {
            ids: [
                'popup-section3-1',
                'popup-section3-2',
                'popup-section3-3',
                'popup-section3-4'
            ],
            autoShow: true,
            autoHide: false
        },
        // Section 4: Benjamin & Noble
        section4: {
            ids: [
                'popup-section4-1',
                'popup-section4-2'
            ],
            autoShow: true,
            autoHide: false
        },
        // Section 5: More Headlines
        section5: {
            ids: [
                'popup-section5-1',
                'popup-section5-2',
                'popup-section5-3',
                'popup-section5-4'
            ],
            autoShow: true,
            autoHide: false
        },
        // Section 6: Malm
        section6: {
            id: 'popup-section6',
            autoShow: true,
            autoHide: false
        },
        // Section 7: Guacamaya
        section7: {
            ids: [
                'popup-section7-1',
                'popup-section7-2'
            ],
            autoShow: true,
            autoHide: false
        },
        // Section 8: Experiments
        section8: {
            ids: [
                'popup-section8-1',
                'popup-section8-2'
            ],
            autoShow: true,
            autoHide: false
        },
        // Section 9: Spinning Book
        section9: {
            id: 'popup-section9',
            autoShow: true,
            autoHide: false
        },
        // Section 10: Special
        section10: {
            id: 'popup-section10',
            autoShow: false, // Manual trigger only
            autoHide: false
        }
    }
};

// ============================================
// POPUP MANAGER
// ============================================
const PopupManager = {
    activePopups: new Set(),
    
    init() {
        // Initialize all popups as hidden and draggable
        document.querySelectorAll('.content-popup').forEach(popup => {
            popup.style.display = 'none';
            this.makeDraggable(popup);
            this.setupControls(popup);
        });
        
        // Initialize videos
        this.initVideos();
    },
    
    initVideos() {
        const videos = document.querySelectorAll('.content-popup video');
        videos.forEach(video => {
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.preload = 'auto';
        });
    },
    
    show(popupId) {
        const popup = document.getElementById(popupId);
        if (!popup) return;
        
        popup.style.display = 'block';
        popup.style.zIndex = 1000 + this.activePopups.size;
        this.activePopups.add(popupId);
        
        // Bring to front on click
        popup.addEventListener('mousedown', () => this.bringToFront(popupId));
        
        // Auto-play video if present
        const video = popup.querySelector('video');
        if (video) {
            video.play().catch(e => console.log('Video autoplay prevented:', e));
        }
        
        // Start spinning animation for book popup
        if (popupId === 'popup-section9') {
            const book = document.getElementById('spinning-book');
            if (book) {
                book.style.animation = 'spin 20s linear infinite';
            }
        }
        
        console.log(`Popup shown: ${popupId}`);
    },
    
    hide(popupId) {
        const popup = document.getElementById(popupId);
        if (!popup) return;
        
        popup.style.display = 'none';
        this.activePopups.delete(popupId);
        
        // Pause video if present
        const video = popup.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    },
    
    hideAll() {
        this.activePopups.forEach(popupId => {
            this.hide(popupId);
        });
        this.activePopups.clear();
    },
    
showForSection(sectionIndex) {
    // Hide all popups first
    this.hideAll();
    
    // Show popups for current section
    switch(sectionIndex) {
        case 0: // Section 1 - Text box only
            break;
            
        case 1: // Section 2 - Video
            this.show(CONFIG.popups.section2.id);
            break;
            
        case 2: // Section 3 - AI Bias
            this.showRandomFromArray(CONFIG.popups.section3.ids, 2);
            break;
            
        case 3: // Section 4 - Benjamin & Noble
            CONFIG.popups.section4.ids.forEach(id => this.show(id));
            break;
            
        case 4: // Section 5 - More Headlines
            this.showRandomFromArray(CONFIG.popups.section5.ids, 2);
            break;
            
        case 5: // Section 6 - Malm
            this.show(CONFIG.popups.section6.id);
            break;
            
        case 6: // Section 7 - Guacamaya
            CONFIG.popups.section7.ids.forEach(id => this.show(id));
            break;
            
        case 7: // Section 8 - Experiments
            CONFIG.popups.section8.ids.forEach(id => this.show(id));
            break;
            
        case 8: // Section 9 - Spinning Book
            this.show(CONFIG.popups.section9.id);
            break;
            
        case 9: // Section 10 - Special
            this.show(CONFIG.popups.section10.id);
            break;
    }
    },
    
    showRandomFromArray(popupIds, count = 1) {
        const shuffled = [...popupIds].sort(() => 0.5 - Math.random());
        shuffled.slice(0, count).forEach(id => this.show(id));
    },
    
    bringToFront(popupId) {
        const popup = document.getElementById(popupId);
        if (!popup) return;
        
        // Get highest z-index
        let maxZ = 1000;
        document.querySelectorAll('.content-popup').forEach(p => {
            const z = parseInt(p.style.zIndex) || 1000;
            if (z > maxZ) maxZ = z;
        });
        
        popup.style.zIndex = maxZ + 1;
    },
    
    makeDraggable(popup) {
        const titlebar = popup.querySelector('.window-titlebar');
        if (!titlebar) return;
        
        let isDragging = false;
        let offsetX, offsetY;
        
        titlebar.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - popup.offsetLeft;
            offsetY = e.clientY - popup.offsetTop;
            titlebar.style.cursor = 'grabbing';
            e.preventDefault();
            
            this.bringToFront(popup.id);
        });
        
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            const newLeft = e.clientX - offsetX;
            const newTop = e.clientY - offsetY;
            
            // Keep within viewport
            const maxLeft = window.innerWidth - popup.offsetWidth;
            const maxTop = window.innerHeight - popup.offsetHeight;
            
            popup.style.left = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
            popup.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
            popup.style.transform = 'none'; // Remove center transform
        };
        
        const handleMouseUp = () => {
            isDragging = false;
            if (titlebar) titlebar.style.cursor = '';
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    },
    
    setupControls(popup) {
        const closeBtn = popup.querySelector('.popup-close');
        const minimizeBtn = popup.querySelector('.popup-minimize');
        const maximizeBtn = popup.querySelector('.popup-maximize');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide(popup.id);
            });
        }
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                popup.style.display = 'none';
                this.activePopups.delete(popup.id);
            });
        }
        
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
                if (popup.style.width === '100%') {
                    // Restore
                    popup.style.width = '450px';
                    popup.style.height = '350px';
                    popup.style.position = 'fixed';
                    popup.style.top = '50px';
                    popup.style.left = '50px';
                    popup.style.transform = 'none';
                } else {
                    // Maximize
                    popup.style.width = '100%';
                    popup.style.height = '100vh';
                    popup.style.top = '0';
                    popup.style.left = '0';
                    popup.style.transform = 'none';
                }
            });
        }
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
    
    // Initialize popup manager
    PopupManager.init();
    
    // Load sprite
    CONFIG.sprite.image.src = 'imgs/man.png';
    CONFIG.sprite.image.onload = () => {
        console.log('Sprite loaded successfully');
        drawPlayer();
    };
    CONFIG.sprite.image.onerror = () => {
        console.error('Failed to load sprite');
        // Draw placeholder
        CONFIG.playerCtx.fillStyle = '#ff6b6b';
        CONFIG.playerCtx.fillRect(0, 0, CONFIG.sprite.width, CONFIG.sprite.height);
    };
    
    // Initialize game state
    CONFIG.currentSection = 0;
    CONFIG.isTransitioning = false;
    
    // Create game sections
    createGameSections();
    
    // Show initial text box
    showTextBox();
    updateSectionIndicator();
    
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
    
    // Main window controls
    const windowControls = document.querySelectorAll('.window-control');
    windowControls[0].addEventListener('click', () => alert('Minimized (simulated)'));
    windowControls[1].addEventListener('click', toggleMaximize);
    windowControls[2].addEventListener('click', closeWindow);
    
    // Window resize
    window.addEventListener('resize', () => {
        CONFIG.sectionWidth = window.innerWidth;
        updateGameWorldPosition();
    });
}

function toggleMaximize() {
    const window = document.querySelector('.windows-window');
    window.style.width = window.style.width === '100%' ? '98%' : '100%';
    window.style.height = window.style.height === '100vh' ? '80vh' : '100vh';
}

function closeWindow() {
    if (confirm('Close game? This will reset your progress.')) {
        document.getElementById('game-container').style.display = 'none';
        // Optionally reset to homepage
        window.location.reload();
    }
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
        
        // Section background (all use same for now)
        section.style.backgroundImage = "url('imgs/snow_mountain.jpeg')";
        
        // Section label
        const label = document.createElement('div');
        label.textContent = `SECTION ${i + 1}`;
        label.style.position = 'absolute';
        label.style.top = '50%';
        label.style.left = '50%';
        label.style.transform = 'translate(-50%, -50%)';
        label.style.fontSize = '48px';
        label.style.color = 'rgba(255, 255, 255, 0.1)';
        label.style.fontWeight = 'bold';
        label.style.userSelect = 'none';
        section.appendChild(label);
        
        CONFIG.gameWorld.appendChild(section);
        CONFIG.sectionElements.push(section);
    }
}

function createGameElements() {
    CONFIG.sectionElements.forEach((section, index) => {
        // Add trigger for each section
        const trigger = document.createElement('div');
        trigger.className = 'trigger';
        trigger.dataset.section = index;
        
        if (index === 1) { // Section 2
            trigger.innerHTML = '🎥';
            trigger.title = 'View surveillance feed';
        } else if (index === 5) { // Section 6
            trigger.innerHTML = '📖';
            trigger.title = 'Read about resistance';
        } else {
            trigger.innerHTML = '★';
            trigger.title = 'Activate section';
        }
        
        // Position triggers
        const leftPos = 300 + (index * 120);
        const topPos = 150 + (index * 50);
        
        trigger.style.position = 'absolute';
        trigger.style.left = `${leftPos}px`;
        trigger.style.top = `${topPos}px`;
        trigger.style.width = '40px';
        trigger.style.height = '40px';
        trigger.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        trigger.style.border = '2px solid white';
        trigger.style.borderRadius = '50%';
        trigger.style.display = 'flex';
        trigger.style.alignItems = 'center';
        trigger.style.justifyContent = 'center';
        trigger.style.cursor = 'pointer';
        trigger.style.fontSize = '20px';
        trigger.style.zIndex = '5';
        
        // Click handler
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            activateSectionTrigger(index);
        });
        
        section.appendChild(trigger);
    });
}

function activateSectionTrigger(sectionIndex) {
    const section = CONFIG.sectionElements[sectionIndex];
    
    // Visual feedback
    section.classList.add('animation-active');
    playTriggerSound();
    showNotification(`Section ${sectionIndex + 1} activated!`);
    
    // Special actions for certain sections
    switch(sectionIndex) {
        case 1: // Section 2 - Show video
            PopupManager.show('popup-section2');
            break;
        case 5: // Section 6 - Show Malm book
            PopupManager.show('popup-section6');
            break;
        case 6: // Section 7 - Show Guacamaya
            PopupManager.showRandomFromArray(CONFIG.popups.section7.ids);
            break;
        default:
            // Show random popup for other sections
            const popupKeys = Object.keys(CONFIG.popups);
            const randomKey = popupKeys[Math.floor(Math.random() * popupKeys.length)];
            const popupConfig = CONFIG.popups[randomKey];
            
            if (popupConfig.ids) {
                PopupManager.showRandomFromArray(popupConfig.ids, 1);
            } else if (popupConfig.id) {
                PopupManager.show(popupConfig.id);
            }
    }
    
    // Remove animation after 3 seconds
    setTimeout(() => {
        section.classList.remove('animation-active');
    }, 3000);
}

function playTriggerSound() {
    try {
        const audio = new (AudioContext || webkitAudioContext)();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.frequency.value = 800 + Math.random() * 400;
        gain.gain.setValueAtTime(0.3, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audio.currentTime + 0.5);
    } catch (e) {
        // Audio context not supported
    }
}

// ============================================
// PLAYER CONTROLS & ANIMATION
// ============================================
function startGameLoop() {
    function gameLoop() {
        updatePlayer();
        drawPlayer();
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
}

function updatePlayer() {
    let moved = false;
    
    // Left movement
    if (CONFIG.keys['ArrowLeft'] || CONFIG.keys['a']) {
        movePlayer(-CONFIG.playerSpeed);
        moved = true;
        CONFIG.sprite.direction = 1; // west
    }
    
    // Right movement
    if (CONFIG.keys['ArrowRight'] || CONFIG.keys['d']) {
        movePlayer(CONFIG.playerSpeed);
        moved = true;
        CONFIG.sprite.direction = 0; // east
    }
    
    // Jump (Spacebar)
    if (CONFIG.keys[' ']) {
        CONFIG.playerCanvas.style.bottom = '73px'; // 20px jump
        setTimeout(() => {
            CONFIG.playerCanvas.style.bottom = '53px';
        }, 200);
        CONFIG.keys[' '] = false;
    }
    
    // Animation
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

function movePlayer(deltaX) {
    if (CONFIG.isTransitioning) return;
    
    const playerRect = CONFIG.playerCanvas.getBoundingClientRect();
    const windowRect = document.querySelector('.window-content').getBoundingClientRect();
    let newLeft = parseInt(CONFIG.playerCanvas.style.left) || 100;
    newLeft += deltaX;
    
    // Boundaries
    const minLeft = 10;
    const maxLeft = windowRect.width - playerRect.width - 10;
    
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
    
    CONFIG.playerCanvas.style.left = `${newLeft}px`;
}

// ============================================
// SECTION MANAGEMENT
// ============================================
function triggerSectionTransition(direction) {
    if (CONFIG.isTransitioning) return;
    
    const newSection = CONFIG.currentSection + direction;
    if (newSection < 0 || newSection >= CONFIG.totalSections) return;
    
    CONFIG.isTransitioning = true;
    CONFIG.currentSection = newSection;
    
    updateGameWorldPosition();
    
    // Reposition player
    const windowRect = document.querySelector('.window-content').getBoundingClientRect();
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
    
    // Update text box visibility
    const textBox = document.getElementById('text-box-section1');
    if (textBox) {
        textBox.style.display = CONFIG.currentSection === 0 ? 'block' : 'none';
    }
    
    // Show popups for current section
    PopupManager.showForSection(CONFIG.currentSection);
    
    // Update section indicator
    updateSectionIndicator();
}

function updateSectionIndicator() {
    const indicator = document.getElementById('current-section');
    if (indicator) {
        indicator.textContent = CONFIG.currentSection + 1;
    }
}

// ============================================
// TEXT BOX & TYPING EFFECT
// ============================================
function showTextBox() {
    const textBox = document.getElementById('text-box-section1');
    const boxText = document.getElementById('box-text');
    
    if (textBox && boxText) {
        textBox.style.display = 'block';
        
        const message = `My project explores how subversive computational practices such as hacking, data poisoning, and glitch-based resistance can challenge extractive predictive systems and offer ways to protect agency in a world increasingly shaped by demands for computability.`;
        
        typewriterEffect(boxText, message, 40);
    }
}

function typewriterEffect(element, text, speed = 40) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML = text.substring(0, i + 1);
            i++;
            setTimeout(type, speed);
        } else {
            // Add blinking cursor
            const cursor = document.createElement('span');
            cursor.className = 'typewriter-cursor';
            element.appendChild(cursor);
        }
    }
    
    type();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'notification';
    
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(0,0,0,0.8)';
    notification.style.color = '#ffcc00';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '4px';
    notification.style.border = '2px solid #ffcc00';
    notification.style.zIndex = '2000';
    notification.style.fontFamily = "'Courier New', monospace";
    notification.style.fontSize = '14px';
    notification.style.fontWeight = 'bold';
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============================================
// MAIN ENTRY POINT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
    startGameLoop();
    
    console.log('Retro Game Scroller loaded successfully!');
});