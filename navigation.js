// Navigation between the existing game, the world map and the first world.
(() => {
  const screens = { accueil: document.getElementById('accueil'), carte: document.getElementById('carte'), niveau: document.getElementById('niveau') };
  window.talScreen = 'accueil';
  function show(name) {
    for (const [id, element] of Object.entries(screens)) element.hidden = id !== name;
    window.talScreen = name;
    // No held key or touch can leak into the next screen.
    for (const key in touches) touches[key] = false;
    touchesMobiles.clear();
    document.querySelectorAll('.is-pressed').forEach(button => button.classList.remove('is-pressed'));
  }
  window.talOpenMap = () => {
    if (window.talScreen !== 'accueil') return;
    fille.x = 160; garcon.x = 550;
    fille.vx = garcon.vx = 0;
    show('carte');
  };
  document.querySelector('[data-world="1"]').addEventListener('click', () => show('niveau'));
  document.getElementById('retour-accueil').addEventListener('click', () => show('accueil'));
  document.getElementById('retour-carte').addEventListener('click', () => show('carte'));
})();
