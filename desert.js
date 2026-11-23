// Monde Torah : surfaces relevées sur l'illustration originale (2048 × 682).
(() => {
  const stage = document.getElementById('level-game');
  const view = stage.getContext('2d');
  const artwork = new Image();
  artwork.src = 'assets/desert-torah.png';

  const scale = stage.height / 682;
  const width = 2048 * scale;
  const surfaces = [
    [0, 932, 560, 682],
    [932, 1275, 542, 682],
    [944, 1041, 448, 518], // Caisse
    [1275, 1505, 476, 682],
    [1505, 1751, 409, 682],
    [1889, 2048, 431, 682]
  ].map(([left, right, top, bottom]) => ({
    left: left * scale, right: right * scale, top: top * scale, bottom: bottom * scale
  }));
  const players = [
    [fille, 'KeyA', 'KeyD', 'KeyW', 100],
    [garcon, 'ArrowLeft', 'ArrowRight', 'ArrowUp', 200]
  ];
  const checkpoints = new Map();
  const footRadius = 10;
  let camera = 0;
  let leader = fille;
  const status = document.getElementById('level-status');

  const maxHearts = 5;
  const health = new Map();
  const monsters = [];
  let shots = [];
  let assets;
  const hud = document.getElementById('level-hud');
  const spriteRoot = 'assets/monstres/';
  if (typeof fetch === 'function') {
    fetch(spriteRoot + 'animations.json').then(response => {
      if (!response.ok) throw Error('Configuration des monstres indisponible');
      return response.json();
    }).then(config => {
      const paths = [
        ...Object.values(config.monsters).flatMap(monster =>
          Object.values(monster.directions).flatMap(Object.values)),
        ...Object.values(config.projectile.directions)
      ];
      const images = Object.fromEntries(paths.map(path => {
        const image = new Image();
        image.src = spriteRoot + path;
        return [path, image];
      }));
      return Promise.all(Object.values(images).map(image => image.decode()))
        .then(() => { assets = { config, images }; });
    }).catch(error => console.error(error));
  }

  const centerOf = p => p.x + p.largeur / 2;
  const feet = p => p.y + p.hauteur;
  const heroTop = p => feet(p) - 105;

  function renderHealth() {
    const { stars } = window.talProgress.get();
    hud.textContent = players.map(([p], index) => {
      const { hearts } = health.get(p);
      return `${index === 0 ? 'Fille' : 'Garçon'} ${'❤️'.repeat(hearts)}${'🩶'.repeat(maxHearts - hearts)}`;
    }).join('  ·  ') + `  ·  ⭐ ${stars} / 50`;
  }

  function damage(p) {
    const state = health.get(p);
    if (state.shield > 0 || state.hearts === 0) return;
    state.hearts--;
    state.shield = 850;
    if (state.hearts === 0) {
      p.special = null;
      p.vx = p.vy = 0;
    }
    renderHealth();
  }

  function spriteFrame(animation, elapsed) {
    const duration = animation.ms.reduce((sum, ms) => sum + ms, 0);
    let time = animation.loop ? elapsed % duration : elapsed;
    for (let i = 0; i < animation.ms.length; i++) {
      time -= animation.ms[i];
      if (time < 0) return { column: (animation.firstFrame || 0) + i, done: false };
    }
    return { column: (animation.firstFrame || 0) + animation.ms.length - 1, done: true };
  }

  function resetMonsters() {
    shots = [];
    monsters.length = 0;
    for (const [kind, x, speed, bodyHeight, reach] of [
      ['epeiste', 440, 1.15, 67, 56],
      ['tireur', 560, 0.85, 52, 295]
    ]) {
      monsters.push({ kind, x, vitesse: speed, largeur: 42, hauteur: bodyHeight,
        y: surfaces[0].top - bodyHeight, vy: 0, auSol: true, reach,
        direction: 'left', elapsed: 0, action: 'walk', fired: false, cooldown: 0 });
    }
  }

  function setAction(monster, action) {
    if (monster.action === action) return;
    monster.action = action;
    monster.elapsed = 0;
    monster.fired = false;
  }

  function updateCombat(delta, previousFeet) {
    if (!assets) return;
    const available = players.map(([p]) => p).filter(p => health.get(p).hearts > 0);
    for (const monster of monsters) {
      const animations = assets.config.monsters[monster.kind].animations;
      const x = centerOf(monster);
      const target = available.reduce((best, p) => !best ||
        Math.abs(centerOf(p) - x) < Math.abs(centerOf(best) - x) ? p : best, null);
      if (monster.action !== 'defeat') {
        const stomper = available.find(p => previousFeet.get(p) <= monster.y &&
          feet(p) >= monster.y && feet(p) > previousFeet.get(p) &&
          Math.abs(centerOf(p) - x) < 31);
        if (stomper) {
          setAction(monster, 'defeat');
          stomper.y = monster.y - stomper.hauteur;
          stomper.vy = -8;
          stomper.auSol = false;
          stomper.jumpAge = 0;
        }
      }
      monster.elapsed += delta;
      if (!target || monster.action === 'defeat') continue;
      monster.cooldown = Math.max(0, monster.cooldown - delta);
      if (monster.action === 'attack') {
        const attack = animations.attack;
        const frame = spriteFrame(attack, monster.elapsed);
        if (!monster.fired && frame.column >= attack.activeFrame) {
          monster.fired = true;
          const sign = monster.direction === 'left' ? -1 : 1;
          if (monster.kind === 'tireur') {
            const muzzle = attack.muzzleOffset[monster.direction];
            shots.push({ x: x + muzzle.x * .5, y: feet(monster) + muzzle.y * .5,
              sign, direction: monster.direction, elapsed: 0 });
          } else {
            for (const p of available) {
              const distance = (centerOf(p) - x) * sign;
              if (distance >= -10 && distance <= monster.reach &&
                  feet(p) > monster.y + 12 && heroTop(p) < feet(monster)) damage(p);
            }
          }
        }
        if (frame.done) {
          monster.cooldown = monster.kind === 'tireur' ? 950 : 640;
          setAction(monster, 'walk');
        }
        continue;
      }

      const distance = centerOf(target) - x;
      const targetDirection = distance < 0 ? 'left' : 'right';
      monster.direction = targetDirection;
      if (monster.auSol && !monster.cooldown && Math.abs(distance) <= monster.reach &&
          Math.abs(feet(target) - feet(monster)) < (monster.kind === 'tireur' ? 62 : 70)) {
        setAction(monster, 'attack');
        continue;
      }
      const oldBottom = feet(monster);
      const direction = distance < 0 ? -1 : 1;
      const ahead = x + direction * 14;
      const terrainAhead = surfaces.some(s => ahead >= s.left && ahead <= s.right && s.top <= oldBottom + 22);
      if (monster.auSol && (!terrainAhead || monster.blocked)) monster.vy = -10.5;
      monster.x = Math.max(0, Math.min(width - monster.largeur, monster.x + direction * monster.vitesse * (monster.vy < 0 || !monster.auSol ? 3 : 1)));
      monster.vy += .55;
      monster.y += monster.vy;
      resolveTerrain(monster, x, oldBottom);
      monster.blocked = Math.abs(centerOf(monster) - x) < .01;
      if (monster.y > stage.height) {
        const landing = surfaces.find(s => centerOf(monster) >= s.left && centerOf(monster) <= s.right);
        const surface = landing || surfaces.reduce((best, s) =>
          Math.abs(s.left - x) < Math.abs(best.left - x) ? s : best);
        monster.x = Math.max(surface.left, Math.min(surface.right - monster.largeur, monster.x));
        monster.y = surface.top - monster.hauteur;
        monster.vy = 0;
        monster.auSol = true;
      }
      setAction(monster, monster.auSol ? 'walk' : monster.vy < 0 ? 'jump' : 'fall');
    }
    shots = shots.filter(shot => {
      const oldX = shot.x;
      shot.x += shot.sign * delta * .36;
      shot.elapsed += delta;
      const lo = Math.min(oldX, shot.x) - 7;
      const hi = Math.max(oldX, shot.x) + 7;
      if (surfaces.some(s => hi >= s.left && lo <= s.right && shot.y >= s.top && shot.y < s.bottom)) return false;
      const victim = available.find(p => hi > centerOf(p) - 23 && lo < centerOf(p) + 23 &&
        shot.y > heroTop(p) && shot.y < feet(p));
      if (victim) damage(victim);
      return !victim && shot.x >= 0 && shot.x <= width && shot.elapsed < 1800;
    });
  }

  function drawCombat() {
    if (!assets) return;
    const { config, images } = assets;
    const draw = (path, column, row, x, y, anchor, zoom) => {
      const { width: w, height: h } = config.cell;
      view.drawImage(images[path], column * w, row * h, w, h,
        x - anchor.x * zoom, y - anchor.y * zoom, w * zoom, h * zoom);
    };
    for (const monster of monsters) {
      const { animations, directions } = config.monsters[monster.kind];
      const animation = animations[monster.action];
      const frame = spriteFrame(animation, monster.elapsed);
      if (monster.action === 'defeat' && frame.done) continue;
      draw(directions[monster.direction][animation.sheet], frame.column, animation.row,
        centerOf(monster), feet(monster), config.anchor, .5);
    }
    for (const shot of shots) {
      const { projectile } = config;
      const frame = spriteFrame({ ...projectile, loop: true }, shot.elapsed);
      draw(projectile.directions[shot.direction], frame.column, projectile.row,
        shot.x, shot.y, projectile.anchor, .4);
    }
  }

  function placePlayer(player, x, floor) {
    player.x = x;
    player.y = floor - player.hauteur;
    player.vx = player.vy = 0;
    player.auSol = true;
    player.special = null;
  }

  window.talStartDesert = () => {
    camera = 0;
    leader = fille;
    for (const [player, , , , x] of players) {
      const floor = surfaces[0].top;
      placePlayer(player, x, floor);
      checkpoints.set(player, { x, floor });
    }
    for (const [player] of players) health.set(player, { hearts: maxHearts, shield: 0 });
    resetMonsters();
    renderHealth();
    status.textContent = '';
  };

  function movePlayer(player, left, right, up) {
    const oldCenter = player.x + player.largeur / 2;
    const oldBottom = player.y + player.hauteur;
    const wasGrounded = player.auSol;
    deplacer(player, left, right, up, Infinity, width);

    resolveTerrain(player, oldCenter, oldBottom);
    if (player.auSol) {
      if (!wasGrounded) player.landing = 7;
      checkpoints.set(player, { x: player.x, floor: feet(player) });
    }

    if (player.y > stage.height) {
      const { x, floor } = checkpoints.get(player);
      placePlayer(player, x, floor);
    }
  }

  function resolveTerrain(player, oldCenter, oldBottom) {
    // Bloque les flancs des rebords, tout en laissant passer les sauts au-dessus.
    for (const surface of surfaces) {
      const center = player.x + player.largeur / 2;
      if (player.y + player.hauteur <= surface.top || player.y >= surface.bottom) continue;
      if (oldCenter + footRadius <= surface.left && center + footRadius > surface.left) {
        player.x = surface.left - footRadius - player.largeur / 2;
      } else if (oldCenter - footRadius >= surface.right && center - footRadius < surface.right) {
        player.x = surface.right + footRadius - player.largeur / 2;
      }
    }

    player.auSol = false;
    const center = player.x + player.largeur / 2;
    const bottom = player.y + player.hauteur;
    if (player.vy >= 0) {
      const floor = surfaces
        .filter(surface => center + footRadius > surface.left && center - footRadius < surface.right &&
          oldBottom <= surface.top && bottom >= surface.top)
        .reduce((top, surface) => Math.min(top, surface.top), Infinity);
      if (Number.isFinite(floor)) {
        player.y = floor - player.hauteur;
        player.vy = 0;
        player.auSol = true;
      }
    }
  }

  window.talDrawDesert = delta => {
    if (!artwork.complete || !artwork.naturalWidth) {
      status.textContent = artwork.complete ? 'Le décor du désert n’a pas pu se charger.' : 'Chargement du désert…';
      return;
    }

    const previousFeet = new Map();
    const defeated = players.every(([p]) => health.get(p).hearts === 0);
    if (defeated && (touches.KeyW || touches.ArrowUp ||
        touchesMobiles.has('KeyW') || touchesMobiles.has('ArrowUp'))) window.talStartDesert();
    for (const [player, left, right, up] of players) {
      const state = health.get(player);
      state.shield = Math.max(0, state.shield - delta);
      previousFeet.set(player, feet(player));
      if (!state.hearts) continue;
      if (player.special) {
        avancerSpecial(player, delta);
        continue;
      }
      movePlayer(player, left, right, up);
      if (player.vx) leader = player;
    }

    camera = Math.max(0, Math.min(width - stage.width,
      leader.x + leader.largeur / 2 - stage.width / 2));
    // Même en solo, le deuxième héros reste dans la zone visible.
    for (const [player] of players) {
      player.x = Math.max(camera, Math.min(camera + stage.width - player.largeur, player.x));
    }

    updateCombat(delta, previousFeet);

    view.setTransform(1, 0, 0, 1, 0, 0);
    view.clearRect(0, 0, stage.width, stage.height);
    view.save();
    view.translate(-camera, 0);
    view.drawImage(artwork, 0, 0, width, stage.height);
    drawCombat();
    ctx = view;
    for (const [player] of players) {
      const { hearts, shield } = health.get(player);
      if (hearts && Math.floor(shield / 90) % 2 === 0) dessinerPersonnage(player);
    }
    ctx = accueilCtx;
    view.restore();

    const allDefeated = players.every(([p]) => health.get(p).hearts === 0);
    status.textContent = allDefeated ? 'Appuyez sur saut pour recommencer à cinq cœurs.'
      : players.some(([p]) => health.get(p).hearts > 0 && p.auSol && p.x + p.largeur / 2 >= surfaces.at(-1).left)
      ? 'Vous êtes arrivés au marché ! La rencontre avec Sarah arrivera bientôt.'
      : '';
  };
})();
