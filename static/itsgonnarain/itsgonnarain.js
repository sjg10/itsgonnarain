console.log("It's gonna rain");
let audioContext = new AudioContext();
let gAudioBuffer = ''
let loaded = false
let sourceNode = ['', '']

ChannelEnum = {
	    LEFT : 0,
	    RIGHT : 1,
}


function startLoop(audioBuffer, pan = ChannelEnum.LEFT, rate = 1) {
  sourceNode[pan] = audioContext.createBufferSource();
  let pannerNode = audioContext.createStereoPanner();
  sourceNode[pan].buffer = audioBuffer;
  sourceNode[pan].loop = true;
  sourceNode[pan].loopStart = 6.8;
  sourceNode[pan].loopEnd = 10;
  sourceNode[pan].playbackRate.value = rate;
  pannerNode.pan.value = (pan == ChannelEnum.LEFT) ? -1 : 1;

  sourceNode[pan].connect(pannerNode);
  pannerNode.connect(audioContext.destination);
  sourceNode[pan].start(0, 6.8);
}

function startMusic() {
      	document.getElementById("btnPlay").disabled = true;
	startLoop(gAudioBuffer, ChannelEnum.LEFT);
	startLoop(gAudioBuffer, ChannelEnum.RIGHT, 1.002);
      	document.getElementById("btnStop").disabled = false;
}

function stopMusic() {
      	document.getElementById("btnStop").disabled = true;
	sourceNode[ChannelEnum.LEFT].stop()
	sourceNode[ChannelEnum.RIGHT].stop()
      	document.getElementById("btnPlay").disabled = false;
}

function getMusic(audioTrack) {
  fetch(audioTrack)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then( audioBuffer =>
    {
	gAudioBuffer = audioBuffer;
      document.getElementById("btnPlay").disabled = false;
      document.getElementById("btnPlay").innerHTML = "Play";
     })
    .catch(e => console.error(e));
}
