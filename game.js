
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const touches = {};

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
  image: new Image()
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
  image: new Image()
};

fille.image.src = "fille.png";
garcon.image.src = "garcon.png";

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

function deplacer(personnage, gauche, droite, saut) {
  personnage.vx = 0;

  if (touches[gauche]) personnage.vx = -personnage.vitesse;
  if (touches[droite]) personnage.vx = personnage.vitesse;

  if (touches[saut] && personnage.auSol) {
    personnage.vy = -11;
    personnage.auSol = false;
  }

  personnage.x += personnage.vx;
  personnage.vy += gravite;
  personnage.y += personnage.vy;

  if (personnage.y + personnage.hauteur >= sol) {
    personnage.y = sol - personnage.hauteur;
    personnage.vy = 0;
    personnage.auSol = true;
  }

  personnage.x = Math.max(
    0,
    Math.min(canvas.width - personnage.largeur, personnage.x)
  );
}

function dessinerPersonnage(personnage) {
  if (personnage.image.complete && personnage.image.naturalWidth > 0) {
    ctx.drawImage(
      personnage.image,
      personnage.x,
      personnage.y,
      personnage.largeur,
      personnage.hauteur
    );
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
