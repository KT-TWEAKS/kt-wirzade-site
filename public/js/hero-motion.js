export function pointerPercent(pointer, bounds) {
  const clamp = (value) => Math.min(100, Math.max(0, value));
  return {
    x: clamp(((pointer.clientX - bounds.left) / bounds.width) * 100),
    y: clamp(((pointer.clientY - bounds.top) / bounds.height) * 100),
  };
}

if (typeof document !== 'undefined') {
  const hero = document.querySelector('[data-hero-motion]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (hero && !reduced.matches && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', (event) => {
      const point = pointerPercent(event, hero.getBoundingClientRect());
      hero.style.setProperty('--hero-x', `${point.x}%`);
      hero.style.setProperty('--hero-y', `${point.y}%`);
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.removeProperty('--hero-x');
      hero.style.removeProperty('--hero-y');
    });
  }
}
