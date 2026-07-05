function createRevealConfig(element, index) {
    if (element.classList.contains('arch-layer')) {
        return {
            keyframes: [
                { opacity: 0, transform: 'translateX(-60px) rotateY(-8deg)' },
                { opacity: 1, transform: 'translateX(0) rotateY(0deg)' }
            ],
            options: { duration: 900, delay: index * 50 }
        };
    }

    if (element.classList.contains('about-item')) {
        return {
            keyframes: [
                { opacity: 0, transform: 'translateX(-30px)' },
                { opacity: 1, transform: 'translateX(0)' }
            ],
            options: { duration: 700, delay: index * 100 }
        };
    }

    if (element.classList.contains('contact-box')) {
        return {
            keyframes: [
                { opacity: 0, transform: 'translateX(40px)' },
                { opacity: 1, transform: 'translateX(0)' }
            ],
            options: { duration: 900, delay: 0 }
        };
    }

    if (
        element.classList.contains('info-card') ||
        element.classList.contains('scenario-card') ||
        element.classList.contains('mode-card')
    ) {
        return {
            keyframes: [
                { opacity: 0, transform: 'translateY(50px) scale(0.92)' },
                { opacity: 1, transform: 'translateY(0) scale(1)' }
            ],
            options: { duration: 800, delay: (index % 4) * 80 }
        };
    }

    return {
        keyframes: [
            { opacity: 0, transform: 'translateY(40px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ],
        options: { duration: 800, delay: 0 }
    };
}

function prepareElement(element, config) {
    element.style.opacity = '0';
    element.style.transform = config.keyframes[0].transform;
    element.style.willChange = 'transform, opacity';
}

function finalizeElement(element) {
    element.style.opacity = '1';
    element.style.transform = 'none';
    element.style.removeProperty('will-change');
}

function revealElement(element, config) {
    if (typeof element.animate !== 'function') {
        finalizeElement(element);
        return;
    }

    const animation = element.animate(config.keyframes, {
        ...config.options,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'both'
    });

    animation.finished
        .catch(() => undefined)
        .finally(() => finalizeElement(element));
}

function prepareSectionHeader(header) {
    const children = Array.from(header.children);

    children.forEach((child) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(40px)';
        child.style.willChange = 'transform, opacity';
    });

    return () => {
        children.forEach((child, index) => {
            if (typeof child.animate !== 'function') {
                child.style.opacity = '1';
                child.style.transform = 'none';
                child.style.removeProperty('will-change');
                return;
            }

            const animation = child.animate(
                [
                    { opacity: 0, transform: 'translateY(40px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ],
                {
                    duration: 800,
                    delay: index * 120,
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    fill: 'both'
                }
            );

            animation.finished
                .catch(() => undefined)
                .finally(() => {
                    child.style.opacity = '1';
                    child.style.transform = 'none';
                    child.style.removeProperty('will-change');
                });
        });
    };
}

export function initScrollReveals() {
    const headers = Array.from(document.querySelectorAll('.section-header'));
    const layers = Array.from(document.querySelectorAll('.arch-layer'));
    const cards = Array.from(document.querySelectorAll('.info-card, .scenario-card, .mode-card'));
    const aboutItems = Array.from(document.querySelectorAll('.about-item'));
    const contactBox = document.querySelector('.contact-box');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const reveal = entry.target.__revealAction;
                if (typeof reveal === 'function') reveal();
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );

    headers.forEach((header) => {
        header.__revealAction = prepareSectionHeader(header);
        observer.observe(header);
    });

    [...layers, ...cards, ...aboutItems, ...(contactBox ? [contactBox] : [])].forEach((element, index) => {
        const config = createRevealConfig(element, index);
        prepareElement(element, config);
        element.__revealAction = () => revealElement(element, config);
        observer.observe(element);
    });
}
