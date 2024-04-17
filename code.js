const videoElement = document.getElementById("input_video");
const canvasElement = document.getElementById("my_canvas");
const canvasCtx = canvasElement.getContext("2d");
const textConsole = document.getElementById("textConsole");
textConsole.innerHTML = "Jump vision";
//get width and height display properties
var widthDisplay = canvasElement.width;
var heightDisplay = canvasElement.height;
var positionButtonFinal = [100, 50];

//sound
var soundPoint = new Audio("sound/point.mp3");
var errorPoint = new Audio("sound/error.mp3");

//position obstacle
var xs = [widthDisplay];

//positionInitialObstacle
var heightObstacleLarge = 0;
var heightObstacleInitial = 0;
var widtObstacle = 0;

//step obstacle
var step = 10;
//change obstacle
var wasCollision = false;
//point and collision
var pointMore = 0;
var pointLess = 0;
var updateConsole = false;

//true parameters
var trueParameters = false;

function moveLine(x, y) {
  //init path
  canvasCtx.beginPath();
  //move path
  canvasCtx.moveTo(10, 10);
  //canvas draw line
  canvasCtx.lineTo(x, y);
  //canvas draw
  canvasCtx.stroke();
}

function evalueCollision(canvas, points) {
  canvasCtx.strokeStyle = "red";
  canvasCtx.lineWidth = 3;
  canvas.fillStyle = "red";
  //init path
  canvasCtx.beginPath();
  canvas.arc(
    points[31].x * widthDisplay,
    points[31].y * heightDisplay,
    10,
    0,
    2 * Math.PI
  );
  //canvas draw
  canvasCtx.stroke();
  if (trueParameters) {
    //evalue position in x
    if (
      (points[31].x * widthDisplay > xs[0] &&
        points[31].x * widthDisplay < xs[0] + widtObstacle) ||
      (points[32].x * widthDisplay > xs[0] &&
        points[32].x * widthDisplay < xs[0] + widtObstacle)
    ) {
      updateConsole = true;
      //evalue position in y
      if (
        points[31].y * heightDisplay >
          heightObstacleInitial - heightObstacleLarge &&
        points[32].y * heightDisplay >
          heightObstacleInitial - heightObstacleLarge
      ) {
        wasCollision = true;
      }
    } else {
      if (
        points[31].x * widthDisplay > xs[0] &&
        points[31].x * widthDisplay > xs[0] + widtObstacle &&
        updateConsole
      ) {
        updateConsole = false;
        if (wasCollision) {
          pointLess += 1;
          textConsole.innerHTML =
            "Punto: " + pointMore + " Colisión: " + pointLess;
          errorPoint.play();
        } else {
          soundPoint.play();
          pointMore += 1;
          textConsole.innerHTML =
            "Punto: " + pointMore + " Colisión: " + pointLess;
        }
      }
    }
  }
}

/**
 * Start game with parameters
 * @param {*} canvasCtx
 * @param {*} points
 */
function clickStart(canvasCtx, points) {
  if (
    points[20].x * widthDisplay > 0 &&
    points[20].y * heightDisplay > 0 &&
    points[20].x * widthDisplay < positionButtonFinal[0] &&
    points[20].y * heightDisplay < positionButtonFinal[1]
  ) {
    console.log("clickStart");
    trueParameters = true;
  }
}

/**
 * Function draw button for init parameters
 * @param {*} canvasCtx
 * @param {*} points
 */
function buttonStart(canvasCtx, points) {
  canvasCtx.strokeStyle = "black";
  canvasCtx.lineWidth = 1;
  canvasCtx.fillStyle = "green";
  canvasCtx.beginPath();
  canvasCtx.rect(0, 0, positionButtonFinal[0], positionButtonFinal[1]);
  canvasCtx.fill();
  canvasCtx.fillStyle = "white";
  canvasCtx.font = "24px Arial";
  canvasCtx.fillText(
    "Start",
    positionButtonFinal[0] / 4,
    positionButtonFinal[1] / 2
  );
  canvasCtx.stroke();
}

/**
 *
 * @param {object} canvasCtx
 * @param {object[]} points
 * Creaate a obstacle for simulation
 */
function drawObstacle(canvasCtx, points) {
  canvasCtx.strokeStyle = "black";
  canvasCtx.lineWidth = 3;
  canvasCtx.fillStyle = "red";
  canvasCtx.beginPath();
  //reduce position display
  xs[0] -= 10;
  if (trueParameters == false) {
    //width obstacle is
    widtObstacle = widthDisplay / 8;
    heightObstacleLarge = Math.abs(
      (points[30].x - points[29].x) * widthDisplay
    );
    heightObstacleInitial = points[31].y * heightDisplay;
  }

  //create obstacles
  canvasCtx.rect(
    xs[0],
    heightObstacleInitial,
    widtObstacle,
    -heightObstacleLarge
  );
  canvasCtx.fill();
  //canvasCtx.fill();
  canvasCtx.stroke();
  //restart box
  if (xs[0] < 0) {
    xs[0] = widthDisplay;
    //reinit point more
    wasCollision = false;
  }
}

//on results
function onResults(results) {
  if (!results.poseLandmarks) {
    return;
  }

  canvasCtx.save(); // Guarda el estado actual del contexto de dibujo del canvas

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height); // Limpia todo el canvas

  // Dibuja la máscara de segmentación para crear un fondo negro detrás de la persona
  canvasCtx.drawImage(
    results.segmentationMask,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  canvasCtx.globalCompositeOperation = "source-in"; // Solo conserva píxeles donde tanto la fuente como el destino son opacos

  canvasCtx.fillStyle = "#0F00"; // Establece el estilo de relleno para la segmentación.

  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height); // Rellena todo el canvas con el color oscuro

  // Dibuja la imagen original, creando efectivamente un efecto de recorte
  canvasCtx.globalCompositeOperation = "destination-atop";

  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  canvasCtx.globalCompositeOperation = "source-over"; // Restablece el modo de mezcla predeterminado

  // Dibuja las conexiones y los puntos de referencia de la pose encima de todo
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
    color: "#FFFF",
    lineWidth: 6,
  });
  drawLandmarks(canvasCtx, results.poseLandmarks, {
    color: "#000000",
    lineWidth: 2,
  });

  //draw obstacles
  drawObstacle(canvasCtx, results.poseLandmarks);
  //button start
  buttonStart(canvasCtx, results.poseLandmarks);
  //click start
  clickStart(canvasCtx, results.poseLandmarks);
  //evalue collision
  evalueCollision(canvasCtx, results.poseLandmarks);

  canvasCtx.restore(); // Restaura el estado guardado del canvas
}

//pose
const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  },
});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
pose.onResults(onResults);

if ("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices) {
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 500,
    height: 500,
    facingMode: "environment",
  });

  camera.start();
}
