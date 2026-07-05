export function initNavigation() {
    const nav = document.querySelector('.main-nav');
    if (nav) {
        const readVar = (name, fallback) => {
            const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
            return v || fallback;
        };

        const updateNav = () => {
            const scrolled = window.scrollY > 20;
            if (scrolled) {
                nav.style.background = readVar('--nav-bg-scrolled', 'rgba(255, 255, 255, 0.92)');
                nav.style.boxShadow = '0 10px 28px -12px rgba(15, 30, 60, 0.18)';
                nav.style.borderBottomColor = readVar('--nav-border-scrolled', 'rgba(31, 121, 215, 0.18)');
            } else {
                nav.style.background = readVar('--nav-bg', 'rgba(255, 255, 255, 0.75)');
                nav.style.boxShadow = 'none';
                nav.style.borderBottomColor = readVar('--border-soft', 'rgba(15, 30, 60, 0.08)');
            }
        };

        updateNav();
        window.addEventListener('scroll', updateNav, { passive: true });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#' || targetId.length < 2) return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            event.preventDefault();
            const headerOffset = 80;
            const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        });
    });
}
