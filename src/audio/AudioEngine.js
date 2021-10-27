


// const rollTransport = ()=>{
//     Tone.Transport.stop()
//     Tone.Transport.scheduleRepeat(t=>{
//       setTransport(Tone.Transport.position)
//     },'16n',0)
//     Tone.Transport.seconds = 0
//     Tone.Transport.start()
//   }

//   const recHandle = ()=>{
//     if(armedIndex === null) return
    
//     if(micProcess.current.parameters.get('isRecording')){
//       micProcess.current.parameters.get('isRecording').setValueAtTime(0, 0);
//       let source = URL.createObjectURL(new Blob(recorderChunks.current))
//       console.log(source)

//       let track = tracks[armedIndex]
//       track.buffers.push(new Tone.ToneAudioBuffer(source, (buffer)=>{
//         track.player.buffer = buffer
//       }))
//       setRecording(false)
//     }
//     else{
//       playHandle()
//       recorderChunks.current = []
//       micProcess.current.parameters.get('isRecording').setValueAtTime(1, 0);
      
//       setRecording(true)
//     }
//   }
//   const stopHandle =()=>{
//     if(Tone.Transport.state === 'started'){
//       tracks.forEach(t=>{
//         t.player.stop()
//       })
//       Tone.Transport.stop()
//     }
//   }
//   const playHandle = ()=>{
//     if(Tone.Transport.state !== 'started'){

//       //start all tracks that have a recording
//       Tone.Transport.cancel()
//       console.log('start transport')
//       tracks.forEach(t=>{
//         if(t.player.loaded){
//           Tone.Transport.scheduleOnce(()=>{
//               t.player.start()
//           },'0:0:0')
//         }
//       })
//       rollTransport()
//     }
//     setRecording(false)
//   }


import * as Tone from 'tone'
import newid from 'uniqid';

export const AudioEngine = {
  ac: null,
  tonejs: null,
  micNode: null,
  lastRecording: new Float32Array(0),
  lastBufferId: null,
  bufferPool: Object.create(null),
  tracks: [],
    
  init() {
    let ac = this.ac  = Tone.getContext().rawContext._nativeContext
      console.log(ac)
        console.log(new AudioContext())
    // ac.name = 'con'
    //   console.log(ac)
    //   console.log(Tone.context)
    // Tone.setContext(ac)
    //   console.log(Tone.context)
    this.tonejs = Tone;
    this.player = new this.tonejs.Player()
    this.player.toDestination()

    navigator.mediaDevices.getUserMedia({audio:{
  		latency: 0.0,
  		echoCancellation: false,
  		mozNoiseSuppression: false,
  		mozAutoGainControl: false
  	},video:false}).then(stream => {
        console.log('permission granted')
        
        const startWorklet = async ()=>{
          console.log('setup mic-processor worklet')
          let micStream = ac.createMediaStreamSource(stream);
          await this.tonejs.start()
          await ac.audioWorklet.addModule('MicWorkletModule.js')
          
          this.addTrack()

          let micNode = new window.AudioWorkletNode(ac, 'mic-worklet')
          micStream.connect(micNode)
    		  micNode.connect(ac.destination)
          
          micNode.port.onmessage = (e)=>{
            if(e.data.eventType === 'onchunk'){
              let len = (e.data.audioChunk.length + this.lastRecording.length)
              let bufnew = new Float32Array(len)
              bufnew.set(this.lastRecording)
              bufnew.set(e.data.audioChunk, this.lastRecording.length)
              this.lastRecording = bufnew
              console.log(len)
            }
            else if(e.data.eventType === 'begin'){
      				this.lastRecordingChunks = []
      			}
            else if(e.data.eventType === 'end'){
              console.log(this.lastRecording)
      				const buf = ac.createBuffer(1,e.data.recLength, ac.sampleRate)
              buf.copyToChannel(Float32Array.from(this.lastRecording),0) 
              this.lastBufferId = newid()
              this.bufferPool[`${this.lastBufferId}`] = new this.tonejs.ToneAudioBuffer(buf)
              this.tracks[0].addRegion(this.lastBufferId,0,1.0)
            }
          }
          this.micNode = micNode
        }
        startWorklet()
    })
    
    return true;
  },
  monitor () {
    if(this.ac === null) return;

    let monitorState = (this.micNode.parameters.get('monitorState').value > 0)
    
    if(!monitorState){
      this.micNode.parameters.get('monitorState').setValueAtTime(1, 0);
    }
	  else{
	  	this.micNode.parameters.get('monitorState').setValueAtTime(0, 0);
    }

	  return !monitorState
  },
  record (trackIndex) {
    if(this.ac === null) return;

    let recState = (this.micNode.parameters.get('recState').value > 0)
    
    if(!recState){
      this.micNode.parameters.get('recState').setValueAtTime(1, 0);
    } 
	  else{
	  	this.micNode.parameters.get('recState').setValueAtTime(0, 0);
    }
 
  },
  transportPlay(setTransportLabel){
    if(this.ac === null) return;
  
    
    if(this.tonejs.Transport.state !== 'stopped'){
      this.tonejs.Transport.stop()
      this.tonejs.Transport.cancel()
      return;
    }
    
    
    this.tracks.forEach(tr => {
      tr.regions.forEach(reg => {
        this.tonejs.Transport.schedule(t => {
            tr.player.buffer = this.bufferPool[`${reg.bufferId}`]
            tr.player.start(t,reg.timeBufferOffset,reg.timeDuration)
        }, reg.timeStart)
      })
    })

    this.tonejs.Transport.scheduleRepeat(()=>{
      setTransportLabel(this.tonejs.Transport.position)
    },'16n')
    
    this.tonejs.Transport.seconds = 0
    this.tonejs.Transport.start('+0.1')
          
  },
  transportStop(){
    if(this.ac === null) return;
    
    if(this.tonejs.Transport.state !== 'stopped'){
      this.tonejs.Transport.stop()
      this.tonejs.Transport.cancel()
      return;
    }
  },
  
  addTrack(){
      this.tracks.push({
          id:newid(),
          player: new this.tonejs.Player().toDestination(),
          regions: [],
          addRegion(bufferId, start, duration){
              this.regions.push({
                  bufferId: bufferId,
                  timeBufferOffset:0,
                  timeStart:start,
                  timeDuration:duration,
                  timeFadeIn: 0,
                  timeFadeOut: 0,
              })
          }
      })
  },
};
