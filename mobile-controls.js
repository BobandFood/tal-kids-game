// Loaded after game.js. Each finger owns its press until released or cancelled.
(() => {
  const pointers = new Map();
  const buttons = document.querySelectorAll('button[data-key]');
  function release(pointerId) {
    const button = pointers.get(pointerId);
    if (!button) return;
    pointers.delete(pointerId);
    if (![...pointers.values()].includes(button)) {
      touchesMobiles.delete(button.dataset.key);
      button.classList.remove('is-pressed');
    }
  }
  function reset() {
    for (const id of [...pointers.keys()]) release(id);
  }
  for (const button of buttons) {
    button.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      release(event.pointerId);
      const key = button.dataset.key;
      const firstPress = !touchesMobiles.has(key) && !touches[key];
      pointers.set(event.pointerId, button);
      touchesMobiles.add(key);
      button.classList.add('is-pressed');
      button.setPointerCapture(event.pointerId);
      if (firstPress && key === 'KeyS') commencerSpecial(fille);
      if (firstPress && key === 'ArrowDown') commencerSpecial(garcon);
    });
    button.addEventListener('lostpointercapture', (event) => release(event.pointerId));
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  }
  window.addEventListener('pointerup', (event) => release(event.pointerId));
  window.addEventListener('pointercancel', (event) => release(event.pointerId));
  window.addEventListener('blur', reset);
  window.addEventListener('pagehide', reset);
  window.addEventListener('resize', reset);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reset();
  });
})();
