// Shared movement across the welcome screen and the playable world-map stage.
(() => {
  const screens = { accueil: document.getElementById('accueil'), carte: document.getElementById('carte'), niveau: document.getElementById('niveau') };
  const controls = document.querySelector('.touch-controls');
  const status = document.getElementById('map-status');
  window.talScreen = 'accueil';
  function resetInputs() {
    for (const key in touches) touches[key] = false;
    touchesMobiles.clear();
    document.querySelectorAll('.is-pressed').forEach(button => button.classList.remove('is-pressed'));
  }
  function show(name) {
    Object.entries(screens).forEach(([id, element]) => element.hidden = id !== name);
    window.talScreen = name;
    controls.hidden = name === 'niveau';
    resetInputs();
  }
  window.talOpenMap = () => {
    if (window.talScreen !== 'accueil') return;
    for (const [p, x] of [[fille, 80], [garcon, 170]]) {
      p.x=x; p.y=MAP_GROUND-p.hauteur; p.vx=p.vy=0; p.auSol=true; p.special=null;
    }
    show('carte');
  };
  window.talEnterWorld = (world) => {
    if (window.talScreen !== 'carte') return;
    if (world !== 1) { status.textContent='Ce monde est encore verrouillé ! Commence par Torah.'; return; }
    show('niveau');
  };
  document.getElementById('retour-accueil').addEventListener('click', () => {
    for (const [p,x] of [[fille,160],[garcon,550]]) {
      p.x=x; p.y=sol-p.hauteur; p.vx=p.vy=0; p.auSol=true; p.special=null;
    }
    show('accueil');
  });
  document.getElementById('retour-carte').addEventListener('click', () => show('carte'));
})();
