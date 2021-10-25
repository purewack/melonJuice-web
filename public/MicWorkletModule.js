/*
A worklet for recording in sync with AudioContext.currentTime.

More info about the API:
https://developers.google.com/web/updates/2017/12/audio-worklet

How to use:

1. Serve this file from your server (e.g. put it in the "public" folder) as is.

2. Register the worklet:

    const audioContext = new AudioContext();
    audioContext.audioWorklet.addModule('path/to/recorderWorkletProcessor.js')
      .then(() => {
        // your code here
      })

3. Whenever you need to record anything, create a WorkletNode, route the 
audio into it, and schedule the values for 'isRecording' parameter:

      const recorderNode = new window.AudioWorkletNode(
        audioContext,
        'recorder-worklet'
      );

      yourSourceNode.connect(recorderNode);
      recorderNode.connect(audioContext.destination);

      recorderNode.port.onmessage = (e) => {
        if (e.data.eventType === 'data') {
          const audioData = e.data.audioBuffer;
          // process pcm data
        }

        if (e.data.eventType === 'stop') {
          // recording has stopped
        }
      };

      recorderNode.parameters.get('isRecording').setValueAtTime(1, time);
      recorderNode.parameters.get('isRecording').setValueAtTime(
        0,
        time + duration
      );
      yourSourceNode.start(time);
      
*/

class RecorderWorkletProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{
      name: 'recState',
	  minValue: 0,
	  maxValue: 1,
      defaultValue: 0,
      automationRate: 'k-rate'
    }];
  }

  constructor() {
    super();
	this._armedChannel = 0
    this._chunkSize = 4096;
    this._chunk = new Float32Array(this._chunkSize);
    this._framesWritten = 0;
	this._recLength = 0;
	this._wasRec = 0
  }

  _flush() {
	let buffer = this._chunk;
	this.port.postMessage({
		eventType: 'onchunk',
		audioChunk: buffer
	});
  }
  _recordingStarted() {
	this._framesWritten = 0;
	this._recLength = 0;
    this.port.postMessage({
      eventType: 'begin'
    });
  }
  _recordingStopped() {
    this.port.postMessage({
      eventType: 'end',
	  recLength: this._recLength
    });
  }

  process(inputs, outputs, parameters) {

	let ins = inputs[0][this._armedChannel]
	const len = ins.length//Math.min(inputs[0][this._armedChannel].length, outputs[0][this._armedChannel].length)
	const rec = parameters.recState[0]

	if(rec && !this._wasRec){
		this._recordingStarted()
	}
	if(!rec && this._wasRec){
		this._recordingStopped()
	}
	if(rec){
		for(let i=0; i<len; i++){
			this._chunk[this._framesWritten + i] =  ins[i]
		}
		this._framesWritten += len; //+=128
		this._recLength += len;

		if(this._framesWritten >= this._chunkSize){
			this._framesWritten = 0
			this._flush()
		}
	}
	this._wasRec = rec

    return true;
  }

}

registerProcessor('mic-worklet', RecorderWorkletProcessor);