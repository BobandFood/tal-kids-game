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
    const { lives, stars } = window.talProgress.get();
    document.getElementById('level-hud').textContent =
      `${'❤️ '.repeat(lives)}${'🩶 '.repeat(3 - lives)}  ⭐ ${stars} / 50`;
    status.textContent = '';
  };

  function movePlayer(player, left, right, up) {
    const oldCenter = player.x + player.largeur / 2;
    const oldBottom = player.y + player.hauteur;
    const wasGrounded = player.auSol;
    deplacer(player, left, right, up, Infinity, width);

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
        if (!wasGrounded) player.landing = 7;
        checkpoints.set(player, { x: player.x, floor });
      }
    }

    if (player.y > stage.height) {
      const { x, floor } = checkpoints.get(player);
      placePlayer(player, x, floor);
    }
  }

  window.talDrawDesert = delta => {
    if (!artwork.complete || !artwork.naturalWidth) {
      status.textContent = artwork.complete ? 'Le décor du désert n’a pas pu se charger.' : 'Chargement du désert…';
      return;
    }

    for (const [player, left, right, up] of players) {
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

    view.setTransform(1, 0, 0, 1, 0, 0);
    view.clearRect(0, 0, stage.width, stage.height);
    view.save();
    view.translate(-camera, 0);
    view.drawImage(artwork, 0, 0, width, stage.height);
    ctx = view;
    dessinerPersonnage(fille);
    dessinerPersonnage(garcon);
    ctx = accueilCtx;
    view.restore();

    status.textContent = players.some(([p]) => p.auSol && p.x + p.largeur / 2 >= surfaces.at(-1).left)
      ? 'Vous êtes arrivés au marché ! La rencontre avec Sarah arrivera bientôt.'
      : '';
  };
})();
