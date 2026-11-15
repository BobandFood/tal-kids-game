
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;
const touches = {};
let tick = 0;

const sol = 385;
const gravite = 0.55;

const fille = {
  x: 160,
  y: sol - 125,
  largeur: 80,
  hauteur: 125,
  vx: 0,
  vy: 0,
  vitesse: 4,
  auSol: true,
  direction: "right", animTick: 0, landing: 0, jumpAge: 0, image: new Image(), leftImage: new Image()
};

const garcon = {
  x: 550,
  y: sol - 125,
  largeur: 80,
  hauteur: 125,
  vx: 0,
  vy: 0,
  vitesse: 4,
  auSol: true,
  direction: "right", animTick: 0, landing: 0, jumpAge: 0, image: new Image(), leftImage: new Image()
};

fille.image.src = "assets/fille/right.png";
fille.leftImage.src = "assets/fille/left.png";
garcon.image.src = "assets/garcon/right.png";
garcon.leftImage.src = "assets/garcon/left.png";

window.addEventListener("keydown", (e) => {
  touches[e.code] = true;

  if ([
    "ArrowLeft", "ArrowRight", "ArrowUp",
    "KeyA", "KeyD", "KeyW"
  ].includes(e.code)) {
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  touches[e.code] = false;
});

window.addEventListener("blur", () => { for (const code in touches) touches[code] = false; });

function deplacer(personnage, gauche, droite, saut) {
  const wasGrounded = personnage.auSol;
  personnage.animTick++;
  if (personnage.landing > 0) personnage.landing--;
  personnage.vx = 0;

  if (touches[gauche]) personnage.vx = -personnage.vitesse;
  if (touches[droite]) personnage.vx = personnage.vitesse;

  if (touches[saut] && personnage.auSol) {
    personnage.jumpAge = 0;
    personnage.vy = -11;
    personnage.auSol = false;
  }

  if (personnage.vx) personnage.direction = personnage.vx < 0 ? "left" : "right";
  if (!personnage.auSol) personnage.jumpAge++;
  personnage.x += personnage.vx;
  personnage.vy += gravite;
  personnage.y += personnage.vy;

  if (personnage.y + personnage.hauteur >= sol) {
    personnage.y = sol - personnage.hauteur;
    personnage.vy = 0;
    personnage.auSol = true;
    if (!wasGrounded) personnage.landing = 7;
  }

  personnage.x = Math.max(
    0,
    Math.min(canvas.width - personnage.largeur, personnage.x)
  );
}

// Rendering only: physics, hitbox and input bindings are preserved.
function animationFrame(p) {
  if (!p.auSol) {
    const frame = p.jumpAge <= 2 ? 0 : p.jumpAge <= 4 ? 1 : p.vy < -2 ? 2 : p.vy <= 2 ? 3 : 4;
    return [3, frame];
  }
  if (p.landing) return [3, 5];
  // Keep speed=4. Walk for the first 12 simulation ticks, then use run poses.
  if (p.vx) {
    p.movingTicks = (p.movingTicks || 0) + 1;
    return [p.movingTicks < 12 ? 1 : 2, Math.floor(p.animTick / 6) % 6];
  }
  p.movingTicks = 0;
  // Blink briefly; the supplied six-frame idle sequence is intentionally slow.
  const phase = p.animTick % 240;
  return [0, phase < 210 ? Math.floor(phase / 35) % 2 : [2,3,4,5][Math.min(3,Math.floor((phase-210)/8))]];
}
function dessinerPersonnage(p) {
  const [row, frame] = animationFrame(p);
  const image = p.direction === "left" ? p.leftImage : p.image;
  if (image.complete && image.naturalWidth === 1536) {
    // Square draw avoids distorting anatomy; feet anchor at y+hauteur.
    const size = 145;
    ctx.drawImage(image, frame*256, row*256, 256, 256,
      p.x + p.largeur/2 - size/2, p.y + p.hauteur - 244/256*size, size, size);
  }
}

function dessiner() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ciel
  ctx.fillStyle = "#DDF5FF";
  ctx.fillRect(0, 0, 800, 450);

  // Sol
  ctx.fillStyle = "#91D59A";
  ctx.fillRect(0, sol, 800, 65);

  // Titre
  ctx.textAlign = "center";
  ctx.fillStyle = "#51358A";
  ctx.font = "bold 38px Arial";
  ctx.fillText("JEU IA", 400, 48);

  // Commandes
  ctx.font = "16px Arial";
  ctx.fillText("Fille : A / D / W", 190, 80);
  ctx.fillText("Garçon : ← / → / ↑", 605, 80);

  deplacer(fille, "KeyA", "KeyD", "KeyW");
  deplacer(garcon, "ArrowLeft", "ArrowRight", "ArrowUp");

  dessinerPersonnage(fille);
  dessinerPersonnage(garcon);

  requestAnimationFrame(dessiner);
}

dessiner();
