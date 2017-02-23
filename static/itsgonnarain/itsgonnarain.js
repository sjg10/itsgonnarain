console.log("It's gonna rain");
let audioContext = new AudioContext();
let audioTrack = document.currentScript.getAttribute('track');
console.log(audioTrack)

function startLoop(audioBuffer, pan = 0, rate = 1) {
  let sourceNode = audioContext.createBufferSource();
  let pannerNode = audioContext.createStereoPanner();
  sourceNode.buffer = audioBuffer;
  sourceNode.loop = true;
  sourceNode.loopStart = 6.8;
  sourceNode.loopEnd = 10;
  sourceNode.playbackRate.value = rate;
  pannerNode.pan.value = pan;

  sourceNode.connect(pannerNode);
  pannerNode.connect(audioContext.destination);
  sourceNode.start(0, 6.8);
}

fetch(audioTrack)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then( audioBuffer =>
  {
    startLoop(audioBuffer, -1);
    startLoop(audioBuffer, 1, 1.002);
   })
  .catch(e => console.error(e));
