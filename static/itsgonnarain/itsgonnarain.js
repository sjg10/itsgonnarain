// The global audioContext for pumping to the speakers
let audioContext = new AudioContext();
// The global buffer that will contain an audio track
let gAudioBuffer = ''
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
	trackLength = Math.floor(((lcm(1000, ratio * 1000) * (timeEnd - timeStart)) / 1000) + timeStart)
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
  sourceNode[pan].start(0, 0);
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
    toggleEnableInput(false, "Playing...");
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
    toggleEnableInput(true);
}

/**
 * Toggle the form input, disabled/enabling the fields.
 * @param {Boolean} Enable (true) or disable input
 * @param {String} Optional string for the load button if disabling
 */
function toggleEnableInput(enable = true, loadButtonString = "Loading...")
{
    document.getElementById("txtRatio").disabled = !enable;
    document.getElementById("txtStart").disabled = !enable;
    document.getElementById("txtEnd").disabled = !enable;
    document.getElementById("selTrack").disabled = !enable;
    document.getElementById("btnLoad").disabled = !enable;
    document.getElementById("btnLoad").innerHTML = enable ? "Load" : loadButtonString;
}
/**
 * Given a prepare array buffer loads the audio to gAudioBuffer and unmasks play button when loaded
 * @param {ArrayBuffer} An array buffer containing an audio file (e.g. wav,mp3)
 * @param {itrackName} String name of the track
 */
function loadMusic(arrayBuffer, trackName) {
    audioContext.decodeAudioData(arrayBuffer)
        .then( audioBuffer =>
        {
            gAudioBuffer = audioBuffer;
            setTrackLength();
            updateTimer(0);
            document.getElementById("pTrack").innerHTML = "Loaded: " + trackName + " - (" +
                timeStart + "s-" + timeEnd + "s), ratio=" + ratio;
            document.getElementById("btnPlay").disabled = false;
            toggleEnableInput(true);
        })
        .catch(e => 
        {
            document.getElementById("pTrack").innerHTML = "Error loading track.";
            toggleEnableInput(true);
            console.error(e);
        })
}

/**
 * Parses the input on a load request and fetches an audio track to be loaded by loadMusic
 * @param {String} URI to fetch
 */
function getMusic() {
    let trackName = ''
    toggleEnableInput(false);
    document.getElementById("pTrack").innerHTML = "<br>";
    trackObject = getTrackFromPK(document.getElementById("selTrack").value);
    if (typeof trackObject != 'undefined') { // i.e. couldn't find the pk i.e not a db elt-must be upload
        audioTrack = trackObject.fields.sound_file;
        trackName = trackObject.fields.name;
    }
    else {
        audioTrack = document.getElementById("fileOpt").files[0];
        trackName = "(Upload) " + document.getElementById("fileOpt").files[0].name;
    }
    ratio = Number(document.getElementById("txtRatio").value);
    timeStart = Number(document.getElementById("txtStart").value);
    timeEnd = Number(document.getElementById("txtEnd").value);
    if(isNaN(ratio) || isNaN(timeStart) || isNaN(timeEnd)) {
        document.getElementById("pTrack").innerHTML = "Error: please input valid numbers.";
        toggleEnableInput(true);
    }
    else {
        if (typeof trackObject != 'undefined') { // i.e. not an upload
            fetch(audioTrack)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => loadMusic(arrayBuffer, trackName));
        }
        else {
            fr = new FileReader();
            fr.onload = function(e) { loadMusic(fr.result, trackName); }
            fr.readAsArrayBuffer(audioTrack);
        }
    }
}

/**
 * Update the txtRatio, txtStartTime and txtEndTime values
 * to the recommended value for the track selected in selTrack
 */ 
function selectChange() {
    let val = document.getElementById("selTrack").value;
    trackObject = getTrackFromPK(document.getElementById("selTrack").value);
    if (typeof trackObject != 'undefined') { // i.e. couldn't find the pk i.e not a db elt-must be upload
        document.getElementById("txtRatio").value = trackObject.fields.recommended_ratio;
        document.getElementById("txtStart").value = trackObject.fields.recommended_start_time;
        document.getElementById("txtEnd").value = trackObject.fields.recommended_end_time;
        document.getElementById("txtFile").innerHTML = "";
    }
    else {
        document.getElementById("fileOpt").click()
        document.getElementById("txtFile").innerHTML = "";
        document.getElementById("txtRatio").value = 0;
        document.getElementById("txtStart").value = 0;
        document.getElementById("txtEnd").value = 0;
    }
}

/**
 * Event handler when a file is chosen to update the associated text.
 * TODO: allow reupload when rechosen
 * TODO: handle no file chosen
 */
function fileChosen() {
    let fileName = '';
    file = document.getElementById("fileOpt").files[0]
    fileName = document.getElementById("fileOpt").files[0].name
    document.getElementById("txtFile").innerHTML = "File: " + fileName;
}
