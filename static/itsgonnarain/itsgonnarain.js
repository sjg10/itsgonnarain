// The global audioContext for pumping to the speakers
let audioContext = new AudioContext();
// The global buffer that will contain an audio track
let gAudioBuffer = ''
// The global loaded boolean that goes true when gAudioBuffer has loaded
let loaded = false
// The global nodes for each track (left and right)
let sourceNode = ['', '']
// The global boolean to see if a track is currently playing
let musicPlaying = false;
// The length of the track that will be set once loaded
let trackLength = 0;

// The timing ratio between the tracks
let ratio = 1.002;
// The time ofset to start the looping within the audio
let timeStart = 6.8;
// The time ofset to end the looping within the audio
let timeEnd = 8.84;

// Grabs the expected json of tracks
let tracks = JSON.parse(trackJSON);
console.log(tracks)
console.log(tracks[0].pk)

// An enum for left and right
ChannelEnum = {
	    LEFT : 0,
	    RIGHT : 1,
}

/**
 * Gets a track object as supplied by django, given a key id
 * @param {Number} pk the id
 * @return {Object} the track onject
 */
function getTrackFromPK(pk) {
    function getPK(track) {
        return track.pk == pk;
    }
    return tracks.find(getPK);
}

/**
 * Returns lowest common multiple of two integers
 * @param {Number} x
 * @param {Number} y
 * @return {Number} lcm
 */
function lcm(x, y) {
   if ((typeof x !== 'number') || (typeof y !== 'number')) 
    return false;
  return (!x || !y) ? 0 : Math.abs((x * y) / gcd(x, y));
}

/**
 * Returns greatest common divisor of two numbers
 * @param {Number} x
 * @param {Number} y
 * @return {Number} gcd
 */
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

/**
 * Updates the trackLength global based on ratio, timeEnd and timeStart
 */
function setTrackLength() {
	trackLength = Math.floor((lcm(1000, ratio * 1000) * (timeEnd - timeStart)) / 1000)
}


/**
 * Using the loaded global gAudioBuffer, will create the left or right node in sourceNode
 * It will then begin playing it on loop using timeStart and timeEnd to cut it
 * @param {ChannelEnum} the channel (LEFT/RIGHT) to start
 * @param {Number} A ratio to 1 to speed up/slow down the track
 */
function startLoop(pan = ChannelEnum.LEFT, rate = 1) {
  sourceNode[pan] = audioContext.createBufferSource();
  let pannerNode = audioContext.createStereoPanner();
  sourceNode[pan].buffer = gAudioBuffer;
  sourceNode[pan].loop = true;
  sourceNode[pan].loopStart = timeStart;
  sourceNode[pan].loopEnd = timeEnd;
  sourceNode[pan].playbackRate.value = rate;
  pannerNode.pan.value = (pan == ChannelEnum.LEFT) ? -1 : 1;

  sourceNode[pan].connect(pannerNode);
  pannerNode.connect(audioContext.destination);
  sourceNode[pan].start(0, 6.8);
}

/**
 * Converts a number of seconds into a 0:00 minutes:seconds string
 * @param {Number} Number of seconds
 * @param {String} The required string
 */
function secondsToString(seconds) {
	minutes = Math.floor(seconds / 60);
	seconds %= 60; 
	return minutes + ':' + Math.floor(seconds / 10) + (seconds % 10);
}

/**
 * Updates the innerHTML of pPlayback time with the given time into trackLength
 * @param {Number} time
 */
function updateTimer(time) {
	document.getElementById("pPlaybackTime").innerHTML = 
		secondsToString(time) + '/' +
		secondsToString(trackLength);
}

/**
 * Increments a static 'tick' and updates the pPlaybackTime
 * Stops playback if the end of the track is reached
 * TODO: potentially call more often and beter pinpoint when to stop
 * Must only be called when music playing
 */
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

/**
 * Begins both audio tracks given the loading of gAudioBuffer.
 * Updates Play button and Stop Button accordingly.
 * Starts the timer
 */
function startMusic() {
      	document.getElementById("btnPlay").disabled = true;
	startLoop(ChannelEnum.LEFT);
	startLoop(ChannelEnum.RIGHT, ratio);
      	document.getElementById("btnStop").disabled = false;
	musicPlaying = true;
	playbackTick.time = 0;
	updateTimer(playbackTick.time);
	playbackTick.interval = setInterval(playbackTick, 1000);
}

/**
 * Ends both audio tracks.
 * Updates Play button and Stop Button accordingly.
 * Ends the timer
 */
function stopMusic() {
    document.getElementById("btnStop").disabled = true;
	sourceNode[ChannelEnum.LEFT].stop()
	sourceNode[ChannelEnum.RIGHT].stop()
	musicPlaying = false;
	clearInterval(playbackTick.interval);
    document.getElementById("btnPlay").disabled = false;
}

/**
 * Fetches an audio track to gAudioBuffer and updates loaded global when loaded.
 * Also unmasks play button when loaded
 * @param {String} URI to fetch
 */
function getMusic() {
    document.getElementById("btnLoad").disabled = "true";
    document.getElementById("btnLoad").innerHTML = "Loading...";
    trackObject = getTrackFromPK(document.getElementById("selTrack").value);
    audioTrack = trackObject.fields.sound_file;
    document.getElementById("txtRatio").disabled = true;
    document.getElementById("txtStart").disabled = true;
    document.getElementById("txtEnd").disabled = true;
    document.getElementById("selTrack").disabled = true;
    ratio = Number(document.getElementById("txtRatio").value);
    timeStart = Number(document.getElementById("txtStart").value);
    timeEnd = Number(document.getElementById("txtEnd").value);
    if(isNaN(ratio) || isNaN(timeStart) || isNaN(timeEnd)) {
        document.getElementById("pError").innerHTML = "Error: please input valid numbers.";
        document.getElementById("txtRatio").disabled = false;
        document.getElementById("txtStart").disabled = false;
        document.getElementById("txtEnd").disabled = false;
        document.getElementById("selTrack").disabled = false;
        document.getElementById("btnLoad").disabled = false;
        document.getElementById("btnLoad").innerHTML = "Load";
    }
    else {
        fetch(audioTrack)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then( audioBuffer =>
            {
                gAudioBuffer = audioBuffer;
                setTrackLength();
                updateTimer(0);
                document.getElementById("btnLoad").innerHTML = "Loaded.";
                document.getElementById("btnPlay").disabled = false;
            })
            .catch(e => 
            {
                document.getElementById("pError").innerHTML = "Error loading track. Could not download.";
                console.error(e);
                document.getElementById("btnLoad").disabled = false;
                document.getElementById("btnLoad").innerHTML = "Load";
            })
    }
}

/**
 * Update the txtRatio, txtStartTime and txtEndTime values
 * to the recommended value for the track selected in selTrack
 */ 
function selectChange(element) {
    trackObject = getTrackFromPK(document.getElementById("selTrack").value);
    document.getElementById("txtRatio").value = trackObject.fields.recommended_ratio;
    document.getElementById("txtStart").value = trackObject.fields.recommended_start_time;
    document.getElementById("txtEnd").value = trackObject.fields.recommended_end_time;
}
