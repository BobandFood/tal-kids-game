const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function start(initial) {
 const events = {}, elements = {};
 const desertTransforms = [];
 function el(id) { return elements[id] ||= {id, width:800, height:450, hidden:false, textContent:'', style:{}, dataset:{}, children:[], classList:{toggle(){}, remove(){}, add(){}}, setAttribute(){}, appendChild(x){this.children.push(x)}, addEventListener(name, fn){this[name]=fn}, getContext(){return {setTransform(){},clearRect(){},save(){},restore(){},scale(){},translate(x){if (id === 'level-game') desertTransforms.push(x)},fillRect(){},fillText(){},drawImage(){}}}}; }
 let saved=initial;
 const context={console,document:{getElementById:el,querySelector:()=>el('controls'),querySelectorAll:()=>[],createElement:()=>el(Math.random()),addEventListener(){}},localStorage:{getItem:()=>saved,setItem:(_,value)=>{saved=value}},Image:class {constructor(){this.complete=true;this.naturalWidth=1536;this.naturalHeight=1024}},requestAnimationFrame(fn){context.nextFrame=fn},addEventListener(name,fn){(events[name] ||= []).push(fn)}};
 context.window=context; vm.createContext(context);
 for(const f of ['game.js','mobile-controls.js','desert.js','navigation.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context,{filename:f});
 return {context,events,elements,desertTransforms,save:()=>saved, eval:s=>vm.runInContext(s,context)};
}
let t=start(); let w=t.context;
assert.deepEqual(Array.from({length:5},(_,i)=>w.talProgress.isUnlocked(i+1)),[true,false,false,false,false]);
assert.equal(w.talProgress.completeWorld(2),false);
assert.equal(w.talProgress.completeWorld(1),true);
assert.equal(w.talProgress.isUnlocked(2),true);
assert.deepEqual(t.elements['portal-locks'].children.map(x=>x.hidden),[true,true,false,false,false]);
w.talProgress.addStars(7); w.talProgress.loseLife();
t=start(t.save()); w=t.context;
assert.equal(w.talProgress.isUnlocked(2),true); assert.equal(w.talProgress.get().stars,7); assert.equal(w.talProgress.get().lives,2);
assert.equal(t.elements['tal-stars'].textContent,'7 / 50');
assert.equal(w.talProgress.isUnlocked(6),false);
for(let id=2;id<=5;id++) assert.equal(w.talProgress.completeWorld(id),true);
assert.deepEqual(t.elements['portal-locks'].children.map(x=>x.hidden),[true,true,true,true,true]);
t=start(JSON.stringify({completed:[2,4],stars:'bad',lives:'bad'})); w=t.context;
assert.equal(w.talProgress.isUnlocked(2),false); assert.equal(w.talProgress.get().stars,0); assert.equal(w.talProgress.get().lives,3);
let girl=t.eval('fille.x'), boy=t.eval('garcon.x');
t.events.keydown.forEach(fn=>fn({code:'KeyD',repeat:false,preventDefault(){}})); t.events.keydown.forEach(fn=>fn({code:'ArrowLeft',repeat:false,preventDefault(){}})); t.context.nextFrame(16);
assert.ok(t.eval('fille.x')>girl); assert.ok(t.eval('garcon.x')<boy);
w.talOpenMap(); assert.equal(w.talScreen,'carte');
t.eval('fille.x = MAP_PORTALS[0] - fille.largeur/2'); w.talUpdatePortalLights();
assert.equal(t.elements['portal-locks'].children[0].hidden,true);
t.eval("touchesMobiles.add('KeyD')"); const mapX=t.eval('fille.x'); t.context.nextFrame(32); assert.ok(t.eval('fille.x')>mapX); t.eval('touchesMobiles.clear()');
assert.equal(t.elements['portal-locks'].children.filter(x=>!x.hidden).length,4);
w.talEnterWorld(2); assert.equal(w.talScreen,'carte');
w.talEnterWorld(1); assert.equal(w.talScreen,'niveau'); assert.equal(t.elements['world-title'].textContent,'Monde 1 — Torah');
t.elements['retour-carte'].click(); assert.equal(w.talScreen,'carte'); assert.equal(w.talProgress.isCompleted(1),false);
t.elements['retour-accueil'].click(); assert.equal(w.talScreen,'accueil');
console.log('Tests réussis : sauvegarde, progression, cadenas, HUD, déplacements et transitions.');

// Exécute le parcours du désert avec le moteur de déplacement réel.
t = start();
t.context.transforms = t.desertTransforms;
t.eval(`
const assert = (ok, label) => { if (!ok) throw Error(label); };
const step = (count = 1) => { for (let i = 0; i < count; i++) talDrawDesert(16); };
const scale = 450 / 682;
const feet = p => p.y + p.hauteur;
const center = p => p.x + p.largeur / 2;
const drive = (p, x) => {
  for (let i = 0; i < 350 && center(p) < x; i++) step();
  assert(center(p) >= x, 'progression vers ' + x + ', position ' + center(p));
};

talOpenMap();
talEnterWorld(1);
step();
assert(Math.abs(feet(fille) - 560 * scale) < .01, 'sol initial');

for (const [p, right, jump] of [[fille, 'KeyD', 'KeyW'], [garcon, 'ArrowRight', 'ArrowUp']]) {
  talStartDesert();
  touches[right] = true;
  drive(p, 500);
  assert(transforms.at(-1) < 0, 'défilement du décor');
  step(45);
  assert(Math.abs(center(p) - (932 * scale - 10)) < .01, 'collision latérale au premier rebord');
  touches[jump] = true;
  drive(p, 1710 * scale);
  touches[jump] = false;
  touches[right] = false;
  step(45);
  assert(p.auSol && Math.abs(feet(p) - 409 * scale) < .01, 'atterrissage avant fossé');

  touches[right] = true;
  step(15);
  touches[right] = false;
  assert(!p.auSol && feet(p) > 409 * scale, 'chute dans le fossé');
  step(50);
  assert(p.auSol && center(p) < 1770 * scale, 'retour au dernier rebord');

  touches[right] = touches[jump] = true;
  drive(p, 1950 * scale);
  touches[right] = touches[jump] = false;
  step(45);
  assert(p.auSol && Math.abs(feet(p) - 431 * scale) < .01, 'atterrissage au marché');
  assert(document.getElementById('level-status').textContent.includes('Sarah'), 'message final');
  assert(!talProgress.isCompleted(1) && !talProgress.isUnlocked(2), 'progression préservée');
}
document.getElementById('retour-carte').click();
assert(talScreen === 'carte', 'retour à la carte');
`);
console.log('Tests réussis : défilement, collisions, sauts et arrivée au marché avec les deux héros.');
