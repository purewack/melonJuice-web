


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

import {calculateRegionRelations} from '../Util'
import * as Tone from 'tone'
import newid from 'uniqid';

export const AudioEngine = {
  actx: null,
  tonejs: null,
  micNode: null,
  lastRecording: new Float32Array(0),
  lastBufferId: null,
  bufferPool: Object.create(null),
  tracks: [],
    
  init() {
    let ac = this.actx  = Tone.getContext().rawContext._nativeContext
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
              //console.log(len)
            }
            else if(e.data.eventType === 'begin'){
      				this.lastRecordingChunks = []
      			}
            else if(e.data.eventType === 'end'){
              //console.log(this.lastRecording)
      				const buf = ac.createBuffer(1,e.data.recLength, ac.sampleRate)
              buf.copyToChannel(Float32Array.from(this.lastRecording),0) 
              this.lastBufferId = newid()
              this.bufferPool[`${this.lastBufferId}`] = new this.tonejs.ToneAudioBuffer(buf)
              
              let recordStartTime = 0 //get actual position of transport
              this.tracks[0].addRegion(this.lastBufferId, recordStartTime, (e.data.recLength/ac.sampleRate) )
            }
          }
          this.micNode = micNode
        }
        startWorklet()
    })
    
    return true;
  },
  monitor () {
    if(this.actx === null) return;

    let monitorState = (this.micNode.parameters.get('monitorState').value > 0)
    
    if(!monitorState){
      this.micNode.parameters.get('monitorState').setValueAtTime(1, 0);
    }
	  else{
	  	this.micNode.parameters.get('monitorState').setValueAtTime(0, 0);
    }

	  return !monitorState
  },
  transportRecord (trackId) {
    if(this.actx === null) return;

    let recState = (this.micNode.parameters.get('recState').value > 0)
    
    if(!recState){
      this.micNode.parameters.get('recState').setValueAtTime(1, 0);
    } 
	  else{
	  	this.micNode.parameters.get('recState').setValueAtTime(0, 0);
    }
 
  },
  transportStop(){
    if(this.actx === null) return;
    
    this.tonejs.Transport.stop()
    this.tonejs.Transport.cancel()
    
    this.tracks.forEach(tr => {
      tr.player.stop()
      tr.envelope.cancel()
    })
    
  },
  transportPlay(setTransportLabel){
    if(this.actx === null) return;
  
    
    if(this.tonejs.Transport.state !== 'stopped'){
      this.transportStop()
      return;
    }
    
    this.tracks.forEach(tr => {
      tr.regions.forEach(reg => {
        this.tonejs.Transport.schedule(t => {
            tr.player.buffer = this.bufferPool[reg.bufferId]
            tr.player.start(t,reg.timeBufferOffset,reg.timeDuration)
            tr.envelope.attack = reg.timeFadeIn
            tr.envelope.release = reg.timeFadeOut
            tr.envelope.triggerAttackRelease(reg.timeDuration - reg.timeFadeOut)
        }, reg.timeStart)
      })
    })

    this.tonejs.Transport.scheduleRepeat(()=>{
      setTransportLabel(this.tonejs.Transport.position)
    },'16n')
    
    this.tonejs.Transport.seconds = 0
    this.tonejs.Transport.start('+0.1')
          
  },
  
  addTrack(){
    const t = {
        trackId: newid(),
        volume: 1.0,
        enable: 1.0,
        // player: new this.tonejs.Player(),
        // envelope: new this.tonejs.AmplitudeEnvelope({
        //   attack:0,
        //   decay:0,
        //   sustain:1,
        //   release:0,
        // }),
        regions: [],
        addRegion(bufferId, start, duration){
            this.regions = calculateRegionRelations([...this.regions,{
              regionId: newid(),
              bufferId: bufferId,
              rBufferOffset:0,
              rBufferDuration:duration,
              rStart:start,
              rDuration:duration,
              rFadeIn: 0.01,
              rFadeOut: 0.01,
              rPlayrate:1.0,
              rLoop:0,
              rPrev:null,
              rNext:null,
          }])
        },
        setRegion(region){
          this.regions = calculateRegionRelations(this.regions.map(r =>{
            if(r.regionId === region.regionId)
            return region
            else
            return r
          }))
        },
        removeRegion(region){
          this.regions = calculateRegionRelations(this.regions.map(r =>{
            if(r.regionId !== region.regionId)
            return r
          }))
        }
    }
    // t.player.connect(t.envelope)
    // t.envelope.toDestination()
    this.tracks.push(t)
  },
};
