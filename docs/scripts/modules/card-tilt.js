export function initCardTilt() {
    const cards = document.querySelectorAll('.info-card');

    cards.forEach((card) => {
        const onMove = (event) => {
            const rect = card.getBoundingClientRect();
            const cx = event.clientX - rect.left;
            const cy = event.clientY - rect.top;
            const px = cx / rect.width - 0.5;
            const py = cy / rect.height - 0.5;
            const rotateY = px * 12;
            const rotateX = -py * 12;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            card.style.setProperty('--mx', `${(cx / rect.width) * 100}%`);
            card.style.setProperty('--my', `${(cy / rect.height) * 100}%`);
        };

        const onLeave = () => {
            card.style.transform = '';
        };

        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
    });
}
