// A soft glow that follows the pointer across a card. The card's CSS reads
// --mx / --my; touch screens never get it.
export function spotlight(selector: string) {
  if (matchMedia('(hover: none)').matches) return;
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}
