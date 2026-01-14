const DrawMode = (function() {
    const canvas = document.getElementById('draw-canvas');
    const ctx = canvas.getContext('2d');

    let isActive = false;
    let isDrawing = false;
    let strokes = [];
    let currentStroke = null;
    let animationId = null;

    const FADE_DURATION = 12000;
    const STROKE_COLOR = { r: 245, g: 240, b: 230 };
    const LINE_WIDTH = 3;

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
            points: [{ x: pos.x, y: pos.y, pressure: pos.pressure }],
            timestamp: Date.now()
        };
    }

    function continueStroke(e) {
        if (!isActive || !isDrawing || !currentStroke) return;
        e.preventDefault();

        const pos = getPosition(e);
        currentStroke.points.push({
            x: pos.x,
            y: pos.y,
            pressure: pos.pressure
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

    function drawStroke(stroke, opacity) {
        if (stroke.points.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${STROKE_COLOR.r}, ${STROKE_COLOR.g}, ${STROKE_COLOR.b}, ${opacity})`;
        ctx.lineWidth = LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

        for (let i = 1; i < stroke.points.length - 1; i++) {
            const p0 = stroke.points[i];
            const p1 = stroke.points[i + 1];
            const midX = (p0.x + p1.x) / 2;
            const midY = (p0.y + p1.y) / 2;
            ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
        }

        const lastPoint = stroke.points[stroke.points.length - 1];
        ctx.lineTo(lastPoint.x, lastPoint.y);
        ctx.stroke();
    }

    function render() {
        if (!isActive) {
            animationId = null;
            return;
        }

        const now = Date.now();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        strokes = strokes.filter(stroke => {
            const age = now - stroke.timestamp;
            if (age >= FADE_DURATION) return false;

            const opacity = 1 - (age / FADE_DURATION);
            drawStroke(stroke, opacity * 0.8);
            return true;
        });

        if (currentStroke && currentStroke.points.length > 1) {
            drawStroke(currentStroke, 0.8);
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
