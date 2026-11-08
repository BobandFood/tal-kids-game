
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function drawWelcomeScreen() {
  ctx.fillStyle = "#202d44";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";

  ctx.fillStyle = "#6ee7b7";
  ctx.font = "bold 36px Arial";
  ctx.fillText("TAL KIDS GAME", 400, 160);

  ctx.fillStyle = "#ffffff";
  ctx.font = "24px Arial";
  ctx.fillText("Notre futur jeu vidéo !", 400, 220);

  ctx.font = "18px Arial";
  ctx.fillText("Imaginé par les enfants", 400, 270);

  ctx.fillStyle = "#fbbf24";
  ctx.fillText("Bientôt, notre aventure commence...", 400, 340);
}

drawWelcomeScreen();
