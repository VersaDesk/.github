import { initBackgroundNetwork } from './modules/background-network.js';
import { initHeroEffects } from './modules/hero.js';
import { initScrollReveals } from './modules/scroll-reveal.js';
import { initCardTilt } from './modules/card-tilt.js';
import { initNavigation } from './modules/navigation.js';
import { initClientBridge } from './modules/client-bridge.js';
import { initI18n } from './modules/i18n.js';

document.body.classList.add('hero-intro-ready');

document.addEventListener('DOMContentLoaded', async () => {
    initI18n();
    initBackgroundNetwork();
    initHeroEffects();
    initScrollReveals();
    initCardTilt();
    initNavigation();
    await initClientBridge();
});
