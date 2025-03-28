let keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function handlePlayerMovement() {
    if (keys['ArrowLeft'] && player.x > 0) player.x -= 5;
    if (keys['ArrowRight'] && player.x < 760) player.x += 5;
    if (keys[' ']) shootBullet(); // Spacebar to shoot
}

setInterval(handlePlayerMovement, 16); // ~60 FPS


function shootBullet() {
    bullets.push({ x: player.x + 17.5, y: player.y, width: 5, height: 10 });
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= 10;
        if (bullet.y < 0) bullets.splice(index, 1);
    });
}


function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        invaders.forEach((invader, iIndex) => {
            if (
                bullet.x < invader.x + invader.width &&
                bullet.x + bullet.width > invader.x &&
                bullet.y < invader.y + invader.height &&
                bullet.y + bullet.height > invader.y
            ) {
                // Remove bullet and invader
                bullets.splice(bIndex, 1);
                invaders.splice(iIndex, 1);
                score += 10;
            }
        });
    });
}



document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') togglePause();
});

function togglePause() {
    isPaused = !isPaused;
    pauseMenu.style.display = isPaused ? 'block' : 'none';
}

continueBtn.addEventListener('click', () => {
    isPaused = false;
    pauseMenu.style.display = 'none';
});

restartBtn.addEventListener('click', () => {
    location.reload();
});



