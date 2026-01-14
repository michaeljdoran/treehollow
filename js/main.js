(function() {
    let currentMode = 'text';
    const modeToggle = document.getElementById('mode-toggle');

    function toggleMode() {
        if (currentMode === 'text') {
            currentMode = 'draw';
            TextMode.deactivate();
            DrawMode.activate();
            modeToggle.classList.add('draw-mode');
            modeToggle.title = 'Switch to text mode';
        } else {
            currentMode = 'text';
            DrawMode.deactivate();
            TextMode.activate();
            modeToggle.classList.remove('draw-mode');
            modeToggle.title = 'Switch to draw mode';
        }
    }

    function init() {
        TextMode.init();
        DrawMode.init();
        TextMode.activate();

        modeToggle.addEventListener('click', toggleMode);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                toggleMode();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
