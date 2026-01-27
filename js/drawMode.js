const DrawMode = (function() {
    const canvas = document.getElementById('draw-canvas');
    const ctx = canvas.getContext('2d');

    let isActive = false;
    let isDrawing = false;
    let strokes = [];
    let currentStroke = null;
    let animationId = null;

    const FADE_DELAY = 2000;
    const FADE_DURATION = 4000;
    const STROKE_COLOR = { r: 245, g: 240, b: 230 };
    const LINE_WIDTH = 5;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function getPosition(e) {
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                pressure: e.touches[0].force || 0.5
            };
        }
        return {
            x: e.clientX,
            y: e.clientY,
            pressure: e.pressure || 0.5
        };
    }

    function startStroke(e) {
        if (!isActive) return;
        e.preventDefault();

        isDrawing = true;
        const pos = getPosition(e);

        currentStroke = {
            points: [{ x: pos.x, y: pos.y, pressure: pos.pressure, timestamp: Date.now() }]
        };
    }

    function continueStroke(e) {
        if (!isActive || !isDrawing || !currentStroke) return;
        e.preventDefault();

        const pos = getPosition(e);
        currentStroke.points.push({
            x: pos.x,
            y: pos.y,
            pressure: pos.pressure,
            timestamp: Date.now()
        });
    }

    function endStroke(e) {
        if (!isDrawing || !currentStroke) return;
        if (e) e.preventDefault();

        if (currentStroke.points.length > 1) {
            strokes.push(currentStroke);
        }

        currentStroke = null;
        isDrawing = false;
    }

    function drawStroke(stroke, now, isCurrentStroke) {
        if (stroke.points.length < 2) return;

        ctx.lineWidth = LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < stroke.points.length - 1; i++) {
            const p0 = stroke.points[i];
            const p1 = stroke.points[i + 1];

            let opacity;
            if (isCurrentStroke) {
                opacity = 0.8;
            } else {
                const age = now - p0.timestamp;
                if (age < FADE_DELAY) {
                    opacity = 0.8;
                } else {
                    opacity = Math.max(0, (1 - (age - FADE_DELAY) / FADE_DURATION) * 0.8);
                }
            }

            if (opacity <= 0) continue;

            const color = `rgba(${STROKE_COLOR.r}, ${STROKE_COLOR.g}, ${STROKE_COLOR.b}, ${opacity})`;

            // Draw circle at point to smooth joints
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(p0.x, p0.y, LINE_WIDTH / 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw line segment
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
        }

        // Draw final point
        const lastPoint = stroke.points[stroke.points.length - 1];
        let lastOpacity;
        if (isCurrentStroke) {
            lastOpacity = 0.8;
        } else {
            const age = now - lastPoint.timestamp;
            if (age < FADE_DELAY) {
                lastOpacity = 0.8;
            } else {
                lastOpacity = Math.max(0, (1 - (age - FADE_DELAY) / FADE_DURATION) * 0.8);
            }
        }
        if (lastOpacity > 0) {
            ctx.beginPath();
            ctx.fillStyle = `rgba(${STROKE_COLOR.r}, ${STROKE_COLOR.g}, ${STROKE_COLOR.b}, ${lastOpacity})`;
            ctx.arc(lastPoint.x, lastPoint.y, LINE_WIDTH / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function render() {
        if (!isActive) {
            animationId = null;
            return;
        }

        const now = Date.now();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        strokes = strokes.filter(stroke => {
            const lastPoint = stroke.points[stroke.points.length - 1];
            const age = now - lastPoint.timestamp;
            if (age >= FADE_DELAY + FADE_DURATION) return false;

            drawStroke(stroke, now, false);
            return true;
        });

        if (currentStroke && currentStroke.points.length > 1) {
            drawStroke(currentStroke, now, true);
        }

        animationId = requestAnimationFrame(render);
    }

    function init() {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        canvas.addEventListener('pointerdown', startStroke);
        canvas.addEventListener('pointermove', continueStroke);
        canvas.addEventListener('pointerup', endStroke);
        canvas.addEventListener('pointerleave', endStroke);
        canvas.addEventListener('pointercancel', endStroke);

        canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    }

    function activate() {
        isActive = true;
        canvas.classList.add('active');

        if (!animationId) {
            animationId = requestAnimationFrame(render);
        }
    }

    function deactivate() {
        isActive = false;
        canvas.classList.remove('active');

        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    return { init, activate, deactivate };
})();
