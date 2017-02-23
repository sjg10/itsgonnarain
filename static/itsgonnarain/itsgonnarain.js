console.log("It's gonna rain");
let audioContext = new AudioContext();
let gAudioBuffer = ''
let loaded = false
let sourceNode = ['', '']
let musicPlaying = false;
let trackLength = 0;
let ratio = 1.002;
let timeStart = 6.8;
let timeEnd = 8.84;

ChannelEnum = {
	    LEFT : 0,
	    RIGHT : 1,
}

function lcm(x, y) {
   if ((typeof x !== 'number') || (typeof y !== 'number')) 
    return false;
  return (!x || !y) ? 0 : Math.abs((x * y) / gcd(x, y));
}

function gcd(x, y) {
  x = Math.abs(x);
  y = Math.abs(y);
  while(y) {
    var t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function setTrackLength() {
	trackLength = Math.floor((lcm(1000, ratio * 1000) * (timeEnd - timeStart)) / 1000)
}


function startLoop(audioBuffer, pan = ChannelEnum.LEFT, rate = 1) {
  sourceNode[pan] = audioContext.createBufferSource();
  let pannerNode = audioContext.createStereoPanner();
  sourceNode[pan].buffer = audioBuffer;
  sourceNode[pan].loop = true;
  sourceNode[pan].loopStart = timeStart;
  sourceNode[pan].loopEnd = timeEnd;
  sourceNode[pan].playbackRate.value = rate;
  pannerNode.pan.value = (pan == ChannelEnum.LEFT) ? -1 : 1;

  sourceNode[pan].connect(pannerNode);
  pannerNode.connect(audioContext.destination);
  sourceNode[pan].start(0, 6.8);
}

function secondsToString(seconds) {
	minutes = Math.floor(seconds / 60);
	seconds %= 60; 
	return minutes + ':' + Math.floor(seconds / 10) + (seconds % 10);
}

function updateTimer(time) {
	document.getElementById("pPlaybackTime").innerHTML = 
		secondsToString(time) + '/' +
		secondsToString(trackLength);
}

function playbackTick() {
	if (!musicPlaying) {
		throw {name : "TickError", message : "tick when no music playing"}; 
	}
	else {
		playbackTick.time = ++playbackTick.time || 0;
		if(playbackTick.time >= trackLength) {
			stopMusic()
			updateTimer(trackLength);
		}
		else {
			updateTimer(playbackTick.time);
		}
	}
}

function startMusic() {
      	document.getElementById("btnPlay").disabled = true;
	startLoop(gAudioBuffer, ChannelEnum.LEFT);
	startLoop(gAudioBuffer, ChannelEnum.RIGHT, ratio);
      	document.getElementById("btnStop").disabled = false;
	musicPlaying = true;
	playbackTick.time = 0;
	updateTimer(playbackTick.time);
	playbackTick.interval = setInterval(playbackTick, 1000);
}

function stopMusic() {
      	document.getElementById("btnStop").disabled = true;
	sourceNode[ChannelEnum.LEFT].stop()
	sourceNode[ChannelEnum.RIGHT].stop()
	musicPlaying = false;
	clearInterval(playbackTick.interval);
      	document.getElementById("btnPlay").disabled = false;
}

function getMusic(audioTrack) {
  fetch(audioTrack)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then( audioBuffer =>
    {
      gAudioBuffer = audioBuffer;
      setTrackLength();
      updateTimer(0);
      document.getElementById("btnPlay").disabled = false;
      document.getElementById("btnPlay").innerHTML = "Play";
     })
    .catch(e => console.error(e));
}
