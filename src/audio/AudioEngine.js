


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
import { randomColor } from '../Util';

const calculateRegionRelations = (regions) => {
  let sorted = regions.slice().sort((a,b)=>{
      if(a.rOffset < b.rOffset){
          return -1
      }
      else if(a.rOffset > b.rOffset){
          return 1
      }
      else return 0
  })
  
  return sorted
  // return sorted.map((r,i,a) => {
  //     r.rPrevId = (i>0 ? a[i-1].regionId : '')
  //     r.rNextId = (i<a.length-1 ? a[i+1].regionId : '')
  //     return r
  // })
}

export const AudioEngine = {
  actx: null,
  tonejs: null,
  micNode: null,
  lastRecording: new Float32Array(0),
  lastBufferId: null,
  bufferPool: [],
  connections: [],
    
  init() {
    
    this.actx  = Tone.getContext().rawContext._nativeContext
    this.tonejs = Tone;
    this.player = new this.tonejs.Player()
    this.player.toDestination()

    return new Promise((resolve, reject) => {
      navigator.mediaDevices.enumerateDevices().then((devices)=>{
        resolve(devices)
      }).catch(()=>{
        reject()
      })
    })
    // navigator.mediaDevices.getUserMedia({audio:{
  	// 	latency: 0.0,
  	// 	echoCancellation: false,
  	// 	mozNoiseSuppression: false,
  	// 	mozAutoGainControl: false
  	// },video:false}).then(stream => {
    //     console.log('permission granted')
        
    //     const startWorklet = async ()=>{
    //       console.log('setup mic-processor worklet')
    //       let micStream = ac.createMediaStreamSource(stream);
    //       await this.tonejs.start()
    //       await ac.audioWorklet.addModule('MicWorkletModule.js')
         
    //       let micNode = new window.AudioWorkletNode(ac, 'mic-worklet')
    //       micStream.connect(micNode)
    // 		  micNode.connect(ac.destination)
          
    //       micNode.port.onmessage = (e)=>{
    //         if(e.data.eventType === 'onchunk'){
    //           let len = (e.data.audioChunk.length + this.lastRecording.length)
    //           let bufnew = new Float32Array(len)
    //           bufnew.set(this.lastRecording)
    //           bufnew.set(e.data.audioChunk, this.lastRecording.length)
    //           this.lastRecording = bufnew
    //           //console.log(len)
    //         }
    //         else if(e.data.eventType === 'begin'){
    //   				this.lastRecordingChunks = []
    //   			}
    //         else if(e.data.eventType === 'end'){
    //           //console.log(this.lastRecording)
    //   				const buf = ac.createBuffer(1,e.data.recLength, ac.sampleRate)
    //           buf.copyToChannel(Float32Array.from(this.lastRecording),0) 
    //           this.lastBufferId = newid()
    //           this.bufferPool[`${this.lastBufferId}`] = new this.tonejs.ToneAudioBuffer(buf)
              
    //           let recordStartTime = 0 //get actual position of transport
    //           this.tracks[0].addRegion(this.lastBufferId, recordStartTime, (e.data.recLength/ac.sampleRate) )
    //         }
    //       }
    //       this.micNode = micNode
    //     }
    //     startWorklet()
    // })
    
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
    
    // this.tracks.forEach(tr => {
    //   tr.regions.forEach(reg => {
    //     this.tonejs.Transport.schedule(t => {
    //         tr.player.buffer = this.bufferPool[reg.bufferId]
    //         tr.player.start(t,reg.bOffset,reg.rDuration)
    //         tr.envelope.attack = reg.timeFadeIn
    //         tr.envelope.release = reg.timeFadeOut
    //         tr.envelope.triggerAttackRelease(reg.rDuration - reg.timeFadeOut)
    //     }, reg.timeStart)
    //   })
    // })

    this.tonejs.Transport.scheduleRepeat(()=>{
      setTransportLabel(this.tonejs.Transport.position)
    },'16n')
    
    this.tonejs.Transport.seconds = 0
    this.tonejs.Transport.start('+0.1')
          
  },
  
  newTrack(){
    const t = {
        trackId: newid(),
        volume: 1.0,
        enable: 1.0,
        regions: [],
        color: randomColor(),
        // player: new this.tonejs.Player(),
        // envelope: new this.tonejs.AmplitudeEnvelope({
        //   attack:0,
        //   decay:0,
        //   sustain:1,
        //   release:0,
        // }),
    }
    // t.player.connect(t.envelope)
    // t.envelope.toDestination()
    return t
  },

  newRegion(bufferId, offset, duration){
    //this.bufferPool = [...this.bufferPool, {bufferId,duration}]

    return {
      regionId: newid(),
      bufferId: bufferId,
      bOffset:0,
      bDuration:duration,
      rOffset:offset,
      rDuration:duration,
      rFadeIn: 0.0,
      rFadeOut: 0.0,
      rPlayrate:1.0,
      rLoop:0,
    }
  },

  cloneRegion(clonee){
    return {...clonee}
  },

  pushRegion(regions,region){
    return calculateRegionRelations([...regions,region])
  },

  setRegions(regions){
    return calculateRegionRelations(regions)
  },
  updateRegion(regions,region){
    return calculateRegionRelations(regions.map(r =>{
      if(r.regionId === region.regionId)
      return region
      else
      return r
    }))
  },
  
  removeRegion(regions,region){
    let idx = null
    regions.forEach((r,i) => {
      if(r.regionId === region.regionId)
        idx = i
    })

    if(idx !== null)
      return calculateRegionRelations( regions.filter((r,i) => {return i !== idx}))
    else
    return regions
  }
};
