
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const personnages = new Image();
personnages.src = "personnages.png";

function dessinerJeu() {
  // Fond bleu ciel
  ctx.fillStyle = "#DDF5FF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Titre du jeu
  ctx.textAlign = "center";
  ctx.fillStyle = "#51358A";
  ctx.font = "bold 42px Arial";
  ctx.fillText("JEU IA", 400, 58);

  // Image des deux personnages
  if (personnages.complete && personnages.naturalWidth > 0) {
    ctx.drawImage(personnages, 180, 75, 440, 330);
  }

  // Message
  ctx.fillStyle = "#51358A";
  ctx.font = "20px Arial";
  ctx.fillText("Nos deux héros sont prêts !", 400, 430);
}

personnages.onload = dessinerJeu;
personnages.onerror = () => {
  console.error("Impossible de charger personnages.png");
};
dessinerJeu();
