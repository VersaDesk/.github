function clearHeroIntroStyles(elements) {
    elements.forEach((element) => {
        element.style.removeProperty('opacity');
        element.style.removeProperty('visibility');
        element.style.removeProperty('transform');
        element.style.removeProperty('will-change');
    });
}

function animateWithFallback(element, keyframes, options) {
    if (typeof element.animate !== 'function') return null;
    const animation = element.animate(keyframes, { ...options, fill: 'both' });
    return animation;
}

function finishAnimation(animation) {
    if (!animation) return Promise.resolve();
    return animation.finished.catch(() => undefined);
}

function initCounterAnimation() {
    document.querySelectorAll('[data-count]').forEach((element) => {
        const target = Number.parseInt(element.dataset.count ?? '0', 10);
        const duration = 1600;
        const startDelay = 1000;
        const startTime = performance.now() + startDelay;

        const tick = (now) => {
            if (now < startTime) {
                window.requestAnimationFrame(tick);
                return;
            }

            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = String(Math.round(target * eased));

            if (progress < 1) window.requestAnimationFrame(tick);
        };

        window.requestAnimationFrame(tick);
    });
}

/* === Hero Card 3D Tilt + Holographic Shine === */
function initHeroCardEffects() {
    const stage = document.querySelector('.hero-card-stage');
    const tilt = stage ? stage.querySelector('.hero-card-tilt') : null;
    if (!stage || !tilt) return;

    // 偵測是否為觸控/小螢幕，避免行動裝置上不必要的 hover 行為
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mql.matches) return;

    const MAX_ROT = 9;          // 最大傾斜角（度）
    const LERP = 0.14;          // 緩動係數
    const PARALLAX_PX = 6;      // 滑鼠視差位移

    let targetRotX = 0, targetRotY = 0;
    let curRotX = 0, curRotY = 0;
    let targetTx = 0, targetTy = 0;
    let curTx = 0, curTy = 0;
    let rafId = 0;
    let active = false;

    const tick = () => {
        curRotX += (targetRotX - curRotX) * LERP;
        curRotY += (targetRotY - curRotY) * LERP;
        curTx += (targetTx - curTx) * LERP;
        curTy += (targetTy - curTy) * LERP;

        tilt.style.transform =
            `perspective(1400px) ` +
            `rotateX(${curRotX.toFixed(2)}deg) ` +
            `rotateY(${curRotY.toFixed(2)}deg) ` +
            `translate3d(${curTx.toFixed(2)}px, ${curTy.toFixed(2)}px, 0)`;

        const stillMoving =
            Math.abs(targetRotX - curRotX) > 0.05 ||
            Math.abs(targetRotY - curRotY) > 0.05 ||
            Math.abs(targetTx - curTx) > 0.1 ||
            Math.abs(targetTy - curTy) > 0.1;

        if (stillMoving || active) {
            rafId = window.requestAnimationFrame(tick);
        } else {
            rafId = 0;
            tilt.style.transform = '';
        }
    };

    const onMove = (event) => {
        const rect = stage.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;   // 0..1
        const py = (event.clientY - rect.top) / rect.height;
        const nx = px - 0.5;  // -0.5..0.5
        const ny = py - 0.5;

        targetRotY = nx * MAX_ROT * 2;       // 左右擺動繞 Y
        targetRotX = -ny * MAX_ROT * 1.5;    // 上下繞 X（反向）
        targetTx = nx * PARALLAX_PX;
        targetTy = ny * PARALLAX_PX;

        // 更新 shine 跟隨點（百分比座標）
        stage.style.setProperty('--mx', `${px * 100}%`);
        stage.style.setProperty('--my', `${py * 100}%`);

        if (!active) {
            active = true;
            stage.classList.add('is-active');
        }
        if (!rafId) rafId = window.requestAnimationFrame(tick);
    };

    const onLeave = () => {
        active = false;
        stage.classList.remove('is-active');
        targetRotX = 0;
        targetRotY = 0;
        targetTx = 0;
        targetTy = 0;
        if (!rafId) rafId = window.requestAnimationFrame(tick);
    };

    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);
}

/* === Chips 入場（透過 stage 的 class，CSS transition 接手） === */
function revealHeroChips() {
    const stage = document.querySelector('.hero-card-stage');
    if (stage) stage.classList.add('chips-revealed');
}

export function initHeroEffects() {
    const body = document.body;
    const heroItems = Array.from(document.querySelectorAll('.js-hero-item'));
    const heroVisual = document.querySelector('.js-hero-visual');
    const introTargets = [
        ...heroItems,
        ...(heroVisual ? [heroVisual] : [])
    ];

    if (!introTargets.length) {
        body.classList.remove('hero-intro-ready');
        return;
    }

    let revealed = false;
    let fallbackTimer = 0;
    const introAnimations = [];

    const revealHero = () => {
        if (revealed) return;
        revealed = true;

        if (fallbackTimer) {
            window.clearTimeout(fallbackTimer);
            fallbackTimer = 0;
        }

        introAnimations.forEach((animation) => animation?.cancel());
        body.classList.remove('hero-intro-ready');
        clearHeroIntroStyles(introTargets);
        revealHeroChips();
        initHeroCardEffects();
    };

    if (typeof Element.prototype.animate !== 'function') {
        revealHero();
        initCounterAnimation();
        return;
    }

    if (heroVisual) {
        heroVisual.style.visibility = 'visible';
        heroVisual.style.willChange = 'transform, opacity';
        introAnimations.push(
            animateWithFallback(
                heroVisual,
                [
                    { opacity: 0, transform: 'scale(0.85) translateY(20px)' },
                    { opacity: 1, transform: 'scale(1) translateY(0)' }
                ],
                {
                    duration: 1100,
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
                }
            )
        );
    }

    heroItems.forEach((item, index) => {
        item.style.visibility = 'visible';
        item.style.willChange = 'transform, opacity';
        introAnimations.push(
            animateWithFallback(
                item,
                [
                    { opacity: 0, transform: 'translateY(30px)' },
                    { opacity: 1, transform: 'translateY(0px)' }
                ],
                {
                    duration: 900,
                    delay: 200 + index * 130,
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
                }
            )
        );
    });

    fallbackTimer = window.setTimeout(revealHero, 2200);

    Promise.all(introAnimations.map(finishAnimation)).finally(revealHero);

    initCounterAnimation();
}
