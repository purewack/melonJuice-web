


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
import wavClickMinor from './metro_click_l.wav'
import wavClickMajor from './metro_click_h.wav'
//import MicWorkletModule from '../../public/MicWorkletModule'

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
  isSetup: false,
  actx: null,
  tonejs: null,
  inputWorklet: true,
  micNode: null,
  isRecording: false,
  lastRecording: [],
  lastBufferId: null,
  bufferPool: [],
  connections: [],
  metronome: null,
  recordingStats: {
    startTimePress:0,
    startTimeReal:0,
    stopTimePress:0,
    stopTimeReal:0,
    startDelta:0,
    stopDelta:0,
  },
  
  awaitPermission(){
    if(this.isSetup) return
    try{
      return new Promise((resolve, reject) => {
        if(navigator.mediaDevices === undefined) 
          reject()
        else 
          navigator.mediaDevices.getUserMedia({audio: true, video: false})
          .then(resolve)
          .catch(reject)
      })
    }
    catch(ex){
      return ex
    }
  },

  hasInputs(){
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.enumerateDevices().then((devices)=>{
        let count = 0
        devices.forEach(d =>{
          if(d.kind === 'audioinput')
            count += 1
        })

        if(count)
          resolve(count)
        else
          reject()
      }).catch(()=>{
        reject()
      })
    })
  },

  getInputs(){
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.enumerateDevices().then((devices)=>{
        resolve(devices)
      }).catch(()=>{
        reject()
      })
    })
  },

  init(inputId) {
    if(this.isSetup) return
    
    this.tonejs = Tone
    this.actx = Tone.context._context._nativeAudioContext

    this.metronome = {
      click_major: new this.tonejs.Player(),
      click_minor: new this.tonejs.Player(),
      volume: 1.0,
      mute: false,
    }

    this.metronome.click_major.toDestination()
    this.metronome.click_minor.toDestination()

    this.metronome.click_minor.load(wavClickMinor)
    this.metronome.click_major.load(wavClickMajor)

    this.inputWorklet = (this.actx?.audioWorklet?.addModule !== undefined)
    this.isSetup = true
   
    if(!inputId) {
      this.tonejs.start()
      return 
    }

    navigator.mediaDevices.getUserMedia({audio:{
  		deviceId: {exact: inputId},
      latency: 0.0,
  		echoCancellation: false,
  		mozNoiseSuppression: false,
  		mozAutoGainControl: false,
  	},video:false}).then(stream => {
      if(this.inputWorklet){
        (async ()=>{
          let micStream = this.actx.createMediaStreamSource(stream);
          await this.actx.audioWorklet.addModule('MicWorkletModule.js')
         
          let micNode = new window.AudioWorkletNode(this.actx, 'mic-worklet', {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [2]
          })
          micStream.connect(micNode)
    		  micNode.connect(this.actx.destination)
          
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
      				const buf = this.actx.createBuffer(1,e.data.recLength, this.actx.sampleRate)
              buf.copyToChannel(Float32Array.from(this.lastRecording),0) 
              //this.lastBufferId = newid()
              //this.bufferPool[`${this.lastBufferId}`] = new this.tonejs.ToneAudioBuffer(buf)
              
              //
              let recordStartTime = 0 //get actual position of transport
              //ihis.tracks[0].addRegion(this.lastBufferId, recordStartTime, (e.data.recLength/ac.sampleRate) )
            }
          }
          this.micNode = micNode
          await this.tonejs.start()
        })()  
      }
      else{
        this.micNode = new MediaRecorder(stream)
        this.micNode.ondataavailable = (e)=>{
          if(e.data.size){
            this.lastRecording.push(e.data)
          }
        }
        this.micNode.onstart = ()=>{ 
          this.recordingStats.startTimeReal = performance.now() 
          this.recordingStats.startDelta = this.recordingStats.startTimeReal-this.recordingStats.startTimePress
        }
        this.tonejs.start()
      }

    })

    return this.inputWorklet
  },

  setBPM(bpm){
    if(this.tonejs)
    this.tonejs.Transport.bpm.value = bpm
  },

  getBPM(){ 
    if(this.tonejs)
    return this.tonejs.Transport.bpm.value
    else 
    return 60
  },

  getBPS(){
    if(this.tonejs)
    return this.tonejs.Transport.bpm.value/60
    else
    return 1.0
  },

  transportRecordStart (trackId, tracks) {
    if(!this.isRecording && trackId){
      this.tonejs.Transport.schedule((t)=>{
        this.lastRecording = []
        this.recordingStats.startTimePress = performance.now()
        this.micNode.start()
        this.isRecording = trackId
      }, 0)

      this.transportPlay(trackId, tracks)
      console.log('started')
    }
    console.log(this.isRecording)
  },
  transportRecordStop (trackId,tracks) {

    if(this.isRecording && trackId){
      this.transportStop(tracks)

      return new Promise((resolve, reject) => {
        this.isRecording = null
        const id = newid()

        console.log('stopping') 
        this.micNode.onstop = (e)=>{
          
          this.recordingStats.stopTimeReal = performance.now()
          this.recordingStats.stopDelta = this.recordingStats.stopTimeReal - this.recordingStats.stopTimePress
          console.log(this.recordingStats)

          const blob = new Blob(this.lastRecording, {type:'audio/mp3;'});
          this.lastRecording = []
          
          const sdx = this.recordingStats.startDelta/1000
          const edx = this.recordingStats.stopDelta/100
          const newRecording = {
            id: id,
            bufferData: new this.tonejs.ToneAudioBuffer(window.URL.createObjectURL(blob)),
            online: true,
            startDeltaSec: sdx,
            stopDeltaSec: edx,
            initialBPM: this.tonejs.Transport.bpm.value,
          }

          newRecording.bufferData.onload = (b)=>{
            this.bufferPool.push(newRecording)
            console.log(this.bufferPool)
            resolve({id:id, durationSeconds:b.duration - sdx - edx})
            this.micNode.onstop = null 
          }
        }
        
        this.recordingStats.stopTimePress = performance.now()
        this.micNode.stop()
      })      
    }
    return new Promise((resolve,reject)=>{
      reject()
    })
  },
  transportStop(tracks){
    //if(this.actx === null) return;
    
    this.tonejs.Transport.stop()
    this.tonejs.Transport.cancel()
    tracks.forEach(tr => {
      tr.player.stop()
      //tr.envelope.cancel()
    })
    
  },
  transportPlay(omitTrackId, tracks){
   // if(this.actx === null) return;
    
    if(this.tonejs.Transport.state !== 'stopped'){
      this.transportStop(tracks)
      return;
    }

    this.schedule(tracks, omitTrackId)
    
    this.tonejs.Transport.seconds = 0
    this.tonejs.Transport.start('+0.1')
          
  },

  schedule(tracks, omitTrackId){
    //const tt = durationMultiplier
    const tt = 1.0
    const ltc = 0.128

    tracks.forEach(tr => {
      if(!tr.regions) return
      if(omitTrackId && tr.trackId === omitTrackId) return

      const bpm = this.tonejs.Transport.bpm.value 
      const bTimeScalar = 60/bpm

      tr.regions.forEach(reg => {
        this.tonejs.Transport.schedule(t => {
            this.bufferPool.forEach(bp => {
              if(bp.id === reg.bufferId){
                tr.player.buffer = bp.bufferData

                const ltc_start = bp.startDeltaSec+ltc
                const ltc_dur = bp.stopDeltaSec+ltc

                const bpmPlayrate = bpm / bp.initialBPM
                tr.player.playbackRate = reg.rPlayrate*bpmPlayrate

                tr.player.start(
                  t, 
                  ltc_start + reg.bOffset*bTimeScalar , 
                  ltc_dur + reg.rDuration*bTimeScalar 
                )
              }
            })
            // tr.envelope.attack = reg.timeFadeIn
            // tr.envelope.release = reg.timeFadeOut
            // tr.envelope.triggerAttackRelease(reg.rDuration - reg.timeFadeOut)
        }, reg.rOffset*bTimeScalar )
      })
    })

    if(this.metronome.volume !== 0.0){
      let b = 0
      this.tonejs.Transport.scheduleRepeat((time)=>{
        if(this.metronome.mute) return
        if(b%4 === 0)
        this.metronome.click_major.start(time)
        else
        this.metronome.click_minor.start(time)

        b+=1
      }, '4n')
    }
  },
  
  newTrack(){
    const t = {
        trackId: newid(),
        volume: 1.0,
        enable: 1.0,
        regions: [],
        color: randomColor(),
        player: new this.tonejs.Player(),
        // envelope: new this.tonejs.AmplitudeEnvelope({
        //   attack:0,
        //   decay:0,
        //   sustain:1,
        //   release:0,
        // }),
    }
    t.player.toDestination()
    //t.player.connect(t.envelope)
    // t.envelope.toDestination()
    return t
  },

  newRegion(bufferId, offset, durationBeat, durationRecord){
    //this.bufferPool = [...this.bufferPool, {bufferId,duration}]

    return {
      regionId: newid(),
      bufferId: bufferId,
      bOffset:0,
      bDuration:durationRecord,
      rOffset:offset,
      rDuration:durationBeat,
      rFadeIn: 0.0,
      rFadeOut: 0.0,
      rPlayrate:1.0,
      bpmPlayrate: 1.0,
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
