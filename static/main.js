// Canvas drawing for Puissance 4
(function(){
  var canvas = document.getElementById("structure");
  if (!canvas) return;
  var context = canvas.getContext("2d");

  // Rectangle (board background)
  context.beginPath();
  context.fillStyle = "blue";
  context.lineWidth = 10;
  context.rect(500,50,600,515);
  context.fill();
  context.closePath();

  // Holes (white)
  context.fillStyle = "white";
  for (var i = 0; i <= 5; i++) {
    for (var j = 0; j <= 6; j++) {
      context.beginPath();
      context.arc(545 + 85 * j, 95 + 85 * i, 35, 0, Math.PI * 2, false);
      context.fill();
      context.closePath();
    }
  }
})();
