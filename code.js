const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('my_canvas');
const canvasCtx = canvasElement.getContext('2d');

var x = 0;
var y = 0;

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


async function getCameraSelection() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    // If there's only one camera, use it directly
    if (videoDevices.length === 1) {
      return videoDevices[0].deviceId;
    }
    
    // Prompt user to select a camera if there are multiple options
    let selectedCameraId;
    if (videoDevices.length > 1) {
      selectedCameraId = await prompt("Select Camera:", videoDevices.map(device => device.label).join("\n"));
    }
    
    return selectedCameraId;
  }

//on results
function onResults(results) {
    if (!results.poseLandmarks) {
      //grid.updateLandmarks([]);
      return;
    }
    canvasCtx.save(); // Guarda el estado actual del contexto de dibujo del canvas

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height); // Limpia todo el canvas
    
    // Dibuja la máscara de segmentación para crear un fondo negro detrás de la persona
    canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
    
    canvasCtx.globalCompositeOperation = 'source-in'; // Solo conserva píxeles donde tanto la fuente como el destino son opacos
    
    canvasCtx.fillStyle = '#0F00'; // Establece el estilo de relleno para la segmentación.
    
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height); // Rellena todo el canvas con el color oscuro
    
    // Dibuja la imagen original, creando efectivamente un efecto de recorte
    canvasCtx.globalCompositeOperation = 'destination-atop';
    
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    
    canvasCtx.globalCompositeOperation = 'source-over'; // Restablece el modo de mezcla predeterminado
    
    // Dibuja las conexiones y los puntos de referencia de la pose encima de todo
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#FFFF', lineWidth: 6});
    drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#000000', lineWidth: 2});
    

    console.log(results.poseLandmarks[0].x);
    canvasCtx.beginPath();

    canvasCtx.fillRect(10,10,20,20);
    canvasCtx.stroke();

    canvasCtx.restore(); // Restaura el estado guardado del canvas
    

}

//pose
const pose = new Pose({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }});
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  pose.onResults(onResults);


if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {  
    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await pose.send({image: videoElement});
        },
        width: 500,
        height: 500,
        facingMode:'environment'
      });
      
      camera.start();
}

//const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
//const grid = new LandmarkGrid(landmarkContainer);
/*
function onResults(results) {
  if (!results.poseLandmarks) {
    grid.updateLandmarks([]);
    return;
  }

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.segmentationMask, 0, 0,
                      canvasElement.width, canvasElement.height);

  // Only overwrite existing pixels.
  canvasCtx.globalCompositeOperation = 'source-in';
  canvasCtx.fillStyle = '#00FF00';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite missing pixels.
  canvasCtx.globalCompositeOperation = 'destination-atop';
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.globalCompositeOperation = 'source-over';
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                 {color: '#00FF00', lineWidth: 4});
  drawLandmarks(canvasCtx, results.poseLandmarks,
                {color: '#FF0000', lineWidth: 2});
  canvasCtx.restore();

  grid.updateLandmarks(results.poseWorldLandmarks);
}

const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();*/