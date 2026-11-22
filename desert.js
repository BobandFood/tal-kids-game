// Monde Torah : coordonnées du décor indépendantes de la caméra.
(() => {
  const stage = document.getElementById('level-game');
  const view = stage.getContext('2d');
  const width = 3600, ground = 385;
  const platforms = [{x:630,y:325,w:150},{x:1130,y:300,w:170},{x:1690,y:325,w:150},{x:2270,y:305,w:170},{x:2900,y:325,w:160}];
  let camera = 0, leader = fille;
  window.talStartDesert = () => {
    camera = 0; leader = fille;
    for (const [p,x] of [[fille,100],[garcon,200]]) {
      p.x=x; p.y=ground-p.hauteur; p.vx=p.vy=0; p.auSol=true; p.special=null;
    }
    const progress = window.talProgress.get();
    document.getElementById('level-hud').textContent = `${'❤️ '.repeat(progress.lives)}${'🩶 '.repeat(3-progress.lives)}  ⭐ ${progress.stars} / 50`;
    document.getElementById('level-status').textContent = '';
  };
  function hills(color, factor, base, height, spacing) {
    view.fillStyle=color;
    const offset = (camera * factor) % spacing;
    for (let x=-spacing-offset; x<800+spacing; x+=spacing) {
      view.beginPath(); view.moveTo(x,base); view.lineTo(x+spacing/2,base-height); view.lineTo(x+spacing,base); view.closePath(); view.fill();
    }
  }
  function palm(x) {
    view.fillStyle='#9c6033'; view.fillRect(x-6,260,12,125);
    view.strokeStyle='#27844c'; view.lineWidth=9; view.lineCap='round';
    for (const [dx,dy] of [[-52,-15],[-36,-45],[0,-52],[36,-45],[52,-15]]) {
      view.beginPath(); view.moveTo(x,265); view.quadraticCurveTo(x+dx*.6,245+dy,x+dx,270+dy); view.stroke();
    }
  }
  function cactus(x) {
    view.strokeStyle='#3a9a63'; view.lineWidth=15; view.lineCap='round';
    view.beginPath(); view.moveTo(x,382); view.lineTo(x,327); view.moveTo(x,360); view.lineTo(x-18,360); view.lineTo(x-18,344); view.moveTo(x,350); view.lineTo(x+17,350); view.lineTo(x+17,335); view.stroke();
  }
  window.talDrawDesert = delta => {
    const people=[[fille,'KeyA','KeyD','KeyW'],[garcon,'ArrowLeft','ArrowRight','ArrowUp']];
    for (const [p,left,right,up] of people) {
      const oldBottom=p.y+p.hauteur;
      deplacer(p,left,right,up,ground,width);
      if (p.vx) leader=p;
      if (p.y+p.hauteur < ground) {
        p.auSol=false;
        if (p.vy>=0) for (const plat of platforms) {
          if (oldBottom<=plat.y+1 && p.y+p.hauteur>=plat.y && p.x+p.largeur>plat.x && p.x<plat.x+plat.w) {
            p.y=plat.y-p.hauteur; p.vy=0; p.auSol=true; p.landing=7; break;
          }
        }
      }
      if (p.special) avancerSpecial(p,delta);
    }
    camera=Math.max(0,Math.min(width-800,leader.x+leader.largeur/2-400));
    // Les deux héros restent visibles même si un seul joueur avance.
    for (const [p] of people) p.x=Math.max(camera,Math.min(camera+800-p.largeur,p.x));
    view.setTransform(1,0,0,1,0,0); view.clearRect(0,0,800,450);
    const sky=view.createLinearGradient(0,0,0,385); sky.addColorStop(0,'#73d7fa'); sky.addColorStop(1,'#e4f8fc'); view.fillStyle=sky; view.fillRect(0,0,800,450);
    view.fillStyle='#ffdc55'; view.beginPath(); view.arc(690,70,38,0,Math.PI*2); view.fill();
    hills('#c9ad97',0.15,335,125,300); hills('#d9b68e',0.32,370,92,250);
    view.fillStyle='#efcc89'; view.fillRect(0,365,800,85);
    view.save(); view.translate(-camera,0);
    for (const x of [260,970,1510,2380,3200]) palm(x);
    for (const x of [480,850,1390,1930,2620,3350]) cactus(x);
    view.fillStyle='#d5a65f'; view.fillRect(0,385,width,65); view.fillStyle='#f5d998'; view.fillRect(0,385,width,10);
    for (const p of platforms) { view.fillStyle='#b87c44'; view.fillRect(p.x,p.y,p.w,18); view.fillStyle='#f4d293'; view.fillRect(p.x,p.y,p.w,6); }
    view.fillStyle='#83572e'; view.fillRect(width-65,245,8,140); view.fillStyle='#fff4c4'; view.fillRect(width-57,248,48,35);
    ctx=view; dessinerPersonnage(fille); dessinerPersonnage(garcon); ctx=accueilCtx;
    view.restore();
    if (leader.x > width-180) document.getElementById('level-status').textContent = 'Bravo ! Vous avez traversé le désert. La rencontre avec Sarah arrivera bientôt !';
  };
})();
