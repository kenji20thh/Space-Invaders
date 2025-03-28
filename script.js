class SpaceInvaders {
    constructor() {
        // Game elements
        this.gameArea = document.getElementById('game-area');
        this.enemyContainer = document.getElementById('enemy-container');
        this.player = document.getElementById('player');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.timerElement = document.getElementById('timer');
        this.pauseMenu = document.getElementById('pause-menu');
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        this.isPaused = false;
        
        // Player properties
        this.playerSpeed = 20;
        this.playerX = window.innerWidth / 2;
        
        // Enemy properties
        this.enemies = [];
        this.enemySpeed = 2;
        this.enemyDirection = 1;
        
        // Projectile properties
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.canShoot = true;
        this.lastShotTime = 0;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Pause menu buttons
        document.getElementById('continue-btn').addEventListener('click', this.togglePause.bind(this));
        document.getElementById('restart-btn').addEventListener('click', this.restartGame.bind(this));
    }
    
    init() {
        this.createEnemies();
        this.createProtectiveBricks();
        this.positionPlayer();
        
        // Event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        
        // Start game loop
        requestAnimationFrame(this.gameLoop);
        
        // Start timer
        this.startTimer();
    }
    
    createEnemies() {
        const enemyTypes = ['enemy-type-1', 'enemy-type-2', 'enemy-type-3', 'enemy-type-4'];
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 10; col++) {
                const enemy = document.createElement('div');
                enemy.classList.add('enemy', enemyTypes[row]);
                enemy.dataset.row = row;
                enemy.dataset.col = col;
                
                const x = col * 60 + (window.innerWidth - 600) / 2;
                const y = row * 60 + 50;
                
                enemy.style.transform = `translate(${x}px, ${y}px)`;
                this.enemyContainer.appendChild(enemy);
                this.enemies.push(enemy);
            }
        }
    }
    
    createProtectiveBricks() {
        const brickPositions = [
            window.innerWidth * 0.2,
            window.innerWidth * 0.4,
            window.innerWidth * 0.6,
            window.innerWidth * 0.8
        ];
        
        brickPositions.forEach(position => {
            const brick = document.createElement('div');
            brick.classList.add('brick');
            brick.style.left = `${position}px`;
            this.gameArea.appendChild(brick);
        });
    }
    
    positionPlayer() {
        this.player.style.left = `${this.playerX}px`;
    }
    
    handleKeyDown(e) {
        if (this.isPaused) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                this.movePlayer(-this.playerSpeed);
                break;
            case 'ArrowRight':
                this.movePlayer(this.playerSpeed);
                break;
            case ' ':
                this.shoot();
                break;
            case 'Escape':
                this.togglePause();
                break;
        }
    }
    
    handleKeyUp(e) {
        // Optional: Add any key release logic if needed
    }
    
    movePlayer(dx) {
        this.playerX += dx;
        
        // Boundary checks
        this.playerX = Math.max(0, Math.min(this.playerX, window.innerWidth - this.player.offsetWidth));
        this.player.style.left = `${this.playerX}px`;
    }
    
    shoot() {
        const now = Date.now();
        if (!this.canShoot || now - this.lastShotTime < 500) return;
        
        const projectile = document.createElement('div');
        projectile.classList.add('projectile');
        
        const startX = this.playerX + this.player.offsetWidth / 2;
        const startY = window.innerHeight - 100;
        
        projectile.style.left = `${startX}px`;
        projectile.style.top = `${startY}px`;
        
        this.gameArea.appendChild(projectile);
        this.projectiles.push(projectile);
        
        this.lastShotTime = now;
    }
    
    moveEnemies() {
        let hitBoundary = false;
        
        this.enemies.forEach(enemy => {
            const currentTransform = enemy.style.transform;
            const match = currentTransform.match(/translate\((\d+)px, (\d+)px\)/);
            
            if (match) {
                let x = parseInt(match[1]);
                let y = parseInt(match[2]);
                
                x += this.enemySpeed * this.enemyDirection;
                
                // Check boundary
                if (x <= 0 || x >= window.innerWidth - 40) {
                    hitBoundary = true;
                }
                
                enemy.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
        
        if (hitBoundary) {
            this.enemyDirection *= -1;
            
            // Move enemies down slightly
            this.enemies.forEach(enemy => {
                const currentTransform = enemy.style.transform;
                const match = currentTransform.match(/translate\((\d+)px, (\d+)px\)/);
                
                if (match) {
                    let x = parseInt(match[1]);
                    let y = parseInt(match[2]);
                    
                    enemy.style.transform = `translate(${x}px, ${y + 20}px)`;
                }
            });
        }
    }
    
    enemyShoot() {
        // Randomly select an enemy from the front row to shoot
        const frontRowEnemies = this.enemies.filter(enemy => 
            parseInt(enemy.dataset.row) === 3 && !enemy.classList.contains('destroyed')
        );
        
        if (frontRowEnemies.length > 0) {
            const shooter = frontRowEnemies[Math.floor(Math.random() * frontRowEnemies.length)];
            
            const projectile = document.createElement('div');
            projectile.classList.add('projectile');
            
            const rect = shooter.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.bottom;
            
            projectile.style.left = `${startX}px`;
            projectile.style.top = `${startY}px`;
            projectile.classList.add('enemy-projectile');
            
            this.gameArea.appendChild(projectile);
            this.enemyProjectiles.push(projectile);
        }
    }
    
    startTimer() {
        const timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.gameTime++;
                const minutes = Math.floor(this.gameTime / 60);
                const seconds = this.gameTime % 60;
                this.timerElement.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseMenu.classList.toggle('hidden');
    }
    
    restartGame() {
        // Reset everything
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        this.scoreElement.textContent = '0';
        this.livesElement.textContent = '3';
        this.timerElement.textContent = '00:00';
        
        // Remove existing enemies and projectiles
        this.enemyContainer.innerHTML = '';
        this.gameArea.querySelectorAll('.projectile').forEach(p => p.remove());
        
        // Recreate enemies and reset player position
        this.createEnemies();
        this.positionPlayer();
        
        // Unpause if needed
        if (this.isPaused) {
            this.togglePause();
        }
    }
    
    gameLoop() {
        if (!this.isPaused) {
            // Move enemies
            this.moveEnemies();
            
            // Periodic enemy shooting
            if (Math.random() < 0.02) {
                this.enemyShoot();
            }
            
            // Move player projectiles
            this.projectiles.forEach((proj, index) => {
                const currentTop = parseInt(proj.style.top);
                proj.style.top = `${currentTop - 10}px`;
                
                // Remove projectile if out of bounds
                if (currentTop < 0) {
                    proj.remove();
                    this.projectiles.splice(index, 1);
                }
            });
            
            // Move enemy projectiles
            this.enemyProjectiles.forEach((proj, index) => {
                const currentTop = parseInt(proj.style.top);
                proj.style.top = `${currentTop + 5}px`;
                
                // Remove projectile if out of bounds
                if (currentTop > window.innerHeight) {
                    proj.remove();
                    this.enemyProjectiles.splice(index, 1);
                }
            });
        }
        
        requestAnimationFrame(this.gameLoop);
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    const game = new SpaceInvaders();
    game.init();
});