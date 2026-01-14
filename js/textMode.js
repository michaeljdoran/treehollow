const TextMode = (function() {
    const container = document.getElementById('letter-container');
    let isActive = true;
    let lastLetterX;
    let lastLetterY;
    let lastTypeTime = 0;

    const INACTIVITY_RESET = 30000;

    function getCenterPosition() {
        return {
            x: window.innerWidth / 2 - 50 + (Math.random() - 0.5) * 100,
            y: window.innerHeight / 2 - 20 + (Math.random() - 0.5) * 60
        };
    }

    function resetToCenter() {
        const center = getCenterPosition();
        lastLetterX = center.x;
        lastLetterY = center.y;
    }

    function checkInactivityReset() {
        if (Date.now() - lastTypeTime > INACTIVITY_RESET) {
            resetToCenter();
        }
    }

    function createLetter(char) {
        if (!isActive) return;

        checkInactivityReset();

        const letter = document.createElement('span');
        letter.className = 'letter';
        letter.textContent = char;

        lastLetterX += 18 + Math.random() * 8;
        lastLetterY += (Math.random() - 0.5) * 8;

        if (lastLetterX > window.innerWidth - 100) {
            lastLetterX = window.innerWidth * 0.2 + Math.random() * 50;
            lastLetterY += 35 + Math.random() * 15;
        }

        if (lastLetterY > window.innerHeight - 100) {
            lastLetterX = window.innerWidth * 0.3 + Math.random() * 100;
            lastLetterY = window.innerHeight * 0.2 + Math.random() * 50;
        }

        lastLetterX = Math.max(50, Math.min(window.innerWidth - 50, lastLetterX));
        lastLetterY = Math.max(50, Math.min(window.innerHeight - 50, lastLetterY));

        letter.style.left = `${lastLetterX}px`;
        letter.style.top = `${lastLetterY}px`;

        const rotation = (Math.random() - 0.5) * 10;
        letter.style.setProperty('--rotation', `${rotation}deg`);

        const drift = (Math.random() - 0.5) * 30;
        letter.style.setProperty('--drift', `${drift}px`);

        container.appendChild(letter);
        lastTypeTime = Date.now();

        setTimeout(() => {
            if (letter.parentNode) {
                letter.remove();
            }
        }, 6000);
    }

    function handleKeyDown(e) {
        if (!isActive) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.key === 'Tab' || e.key === 'Escape') return;

        checkInactivityReset();

        if (e.key === ' ') {
            e.preventDefault();
            lastLetterX += 12;
            lastTypeTime = Date.now();
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            lastLetterX = window.innerWidth * 0.25 + Math.random() * 50;
            lastLetterY += 40 + Math.random() * 15;
            lastTypeTime = Date.now();
            return;
        }

        if (e.key.length > 1) return;

        e.preventDefault();
        createLetter(e.key);
    }

    function init() {
        document.addEventListener('keydown', handleKeyDown);
        resetToCenter();
        lastTypeTime = Date.now();

        window.addEventListener('resize', () => {
            if (Date.now() - lastTypeTime > INACTIVITY_RESET) {
                resetToCenter();
            }
        });
    }

    function activate() {
        isActive = true;
        container.style.display = 'block';
    }

    function deactivate() {
        isActive = false;
    }

    return { init, activate, deactivate };
})();
