// Shared movement across the welcome screen and the playable world-map stage.
(() => {
  const screens = { accueil: document.getElementById('accueil'), carte: document.getElementById('carte'), niveau: document.getElementById('niveau') };
  const controls = document.querySelector('.touch-controls');
  const status = document.getElementById('map-status');
  window.talScreen = 'accueil';
  const SAVE_KEY = 'tal-kids-progress-v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') || {}; } catch (_) {}
  const bounded = (value, fallback, max) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(max, Math.floor(Number(value)))) : fallback;
  const completed = [];
  for (let id = 1; id <= 5 && Array.isArray(saved.completed) && saved.completed.includes(id); id++) completed.push(id);
  const state = { lives: bounded(saved.lives ?? 3, 3, 3), stars: bounded(saved.stars ?? 0, 0, 50), completed }; 
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (_) {} }
  function renderHud() {
    document.getElementById('tal-hearts').textContent = Array.from({length:3}, (_,i)=>i<state.lives?'❤️':'🩶').join(' ');
    document.getElementById('tal-stars').textContent = `${state.stars} / 50`;
  }
  window.talProgress = {
    get: () => ({lives:state.lives, stars:state.stars, completed:[...state.completed]}),
    addStars: n => { if (!Number.isFinite(n) || n<=0) return; state.stars=Math.min(50,state.stars+Math.floor(n)); persist();renderHud(); },
    loseLife: () => { state.lives=Math.max(0,state.lives-1);persist();renderHud(); },
    restoreLife: () => { state.lives=Math.min(3,state.lives+1);persist();renderHud(); },
    completeWorld: id => { if (!Number.isInteger(id)||id<1||id>5 || (id>1&&!state.completed.includes(id-1))) return false; if(!state.completed.includes(id))state.completed.push(id);persist();window.talUpdatePortalLights?.();return true; },
    isUnlocked: id => Number.isInteger(id) && id >= 1 && id <= 5 && (id === 1 || state.completed.includes(id-1)),
    isCompleted: id => state.completed.includes(id)
  };
  renderHud();
  function resetInputs() {
    for (const key in touches) touches[key] = false;
    touchesMobiles.clear();
    mapWasUp.fille = mapWasUp.garcon = false;
    document.querySelectorAll('.is-pressed').forEach(button => button.classList.remove('is-pressed'));
  }
  function show(name) {
    Object.entries(screens).forEach(([id, element]) => element.hidden = id !== name);
    window.talScreen = name;
    controls.hidden = name === 'niveau' && document.getElementById('desert-stage').hidden;
    resetInputs();
  }
  window.talOpenMap = () => {
    if (window.talScreen !== 'accueil') return;
    for (const [p, x] of [[fille, 80], [garcon, 170]]) {
      p.x=x; p.y=MAP_GROUND-p.hauteur; p.vx=p.vy=0; p.auSol=true; p.special=null;
    }
    show('carte');
    window.talUpdatePortalLights?.();
  };
  window.talEnterWorld = (world) => {
    if (window.talScreen !== 'carte') return;
    if (!window.talProgress.isUnlocked(world)) { status.textContent='Ce monde est encore verrouillé !'; return; }
    document.getElementById('world-title').textContent = `Monde ${world} — ${portalNames[world-1]}`;
    document.getElementById('desert-stage').hidden = world !== 1;
    document.getElementById('world-placeholder').hidden = world === 1;
    if (world === 1) window.talStartDesert();
    show('niveau');
  };
  document.getElementById('retour-accueil').addEventListener('click', () => {
    for (const [p,x] of [[fille,160],[garcon,550]]) {
      p.x=x; p.y=sol-p.hauteur; p.vx=p.vy=0; p.auSol=true; p.special=null;
    }
    show('accueil');
  });
  document.getElementById('retour-carte').addEventListener('click', () => { for (const [p,x] of [[fille, MAP_PORTALS[0]-70],[garcon, MAP_PORTALS[0]+20]]) { p.x=x; p.y=MAP_GROUND-p.hauteur; p.vx=p.vy=0; p.auSol=true; p.special=null; } show('carte'); window.talUpdatePortalLights(); });
})();
