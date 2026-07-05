export function initBackgroundNetwork() {
    const container = document.getElementById('networkCanvas');
    if (!container) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    container.replaceChildren(canvas);

    const points = [];
    const pointCount = 60;
    const linkDistance = 150;
    const mouse = { x: -9999, y: -9999 };

    const colors = {
        line: '141, 184, 255',
        mouse: '105, 240, 220',
        point: '152, 220, 255',
        pointAlpha: 0.62,
    };

    const readColors = () => {
        const styles = getComputedStyle(document.documentElement);
        const get = (name, fallback) => (styles.getPropertyValue(name).trim() || fallback);
        colors.line = get('--network-line-rgb', colors.line);
        colors.mouse = get('--network-mouse-rgb', colors.mouse);
        colors.point = get('--network-point-rgb', colors.point);
        const alpha = parseFloat(get('--network-point-alpha', String(colors.pointAlpha)));
        if (!Number.isNaN(alpha)) colors.pointAlpha = alpha;
    };

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    const updateMouse = (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    };

    readColors();
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', updateMouse);

    for (let i = 0; i < pointCount; i += 1) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.4 + 0.6
        });
    }

    const drawLinks = () => {
        for (let i = 0; i < points.length; i += 1) {
            for (let j = i + 1; j < points.length; j += 1) {
                const dx = points[i].x - points[j].x;
                const dy = points[i].y - points[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance >= linkDistance) continue;

                const opacity = (1 - distance / linkDistance) * 0.25;
                ctx.strokeStyle = `rgba(${colors.line}, ${opacity})`;
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[j].x, points[j].y);
                ctx.stroke();
            }

            const dx = points[i].x - mouse.x;
            const dy = points[i].y - mouse.y;
            const mouseDistance = Math.sqrt(dx * dx + dy * dy);

            if (mouseDistance >= 180) continue;

            const opacity = (1 - mouseDistance / 180) * 0.35;
            ctx.strokeStyle = `rgba(${colors.mouse}, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
    };

    const drawPoints = () => {
        points.forEach((point) => {
            point.x += point.vx;
            point.y += point.vy;

            if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
            if (point.y < 0 || point.y > canvas.height) point.vy *= -1;

            ctx.fillStyle = `rgba(${colors.point}, ${colors.pointAlpha})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLinks();
        drawPoints();
        window.requestAnimationFrame(render);
    };

    render();
}
