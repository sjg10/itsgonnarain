console.log("It's gonna rain");
let audioContext = new AudioContext();
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

function stopLoop() {
	sourceNode[ChannelEnum.LEFT].stop()
	sourceNode[ChannelEnum.RIGHT].stop()
}

function playMusic(audioTrack) {
  fetch(audioTrack)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then( audioBuffer =>
    {
      startLoop(audioBuffer, ChannelEnum.LEFT);
      startLoop(audioBuffer, ChannelEnum.RIGHT, 1.002);
     })
    .catch(e => console.error(e));
}
