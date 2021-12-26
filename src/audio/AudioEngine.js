


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
  micNode: null,
  isRecording: false,
  lastRecording: [],
  lastBufferId: null,
  bufferPool: [],
  connections: [],
  metronome: null,
  
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
    let ac = this.actx  = this.tonejs.getContext().rawContext._nativeContext

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

    this.tonejs.start()
    this.isSetup = true
   
    if(!inputId) {
      this.tonejs.start()
      return 
    }

    navigator.mediaDevices.getUserMedia({audio:{
  		deviceId: {exact: inputId},
  	},video:false}).then(stream => {
      this.micNode = new MediaRecorder(stream)
      this.micNode.ondataavailable = (e)=>{
        if(e.data.size){
          console.log('chunk')
          this.lastRecording.push(e.data)
        }
      }
      console.log(this.micNode)
    })
  },

  transportRecordStart (bpm, trackId, tracks, durationMultiplier) {
    if(!this.isRecording && trackId){
      this.transportPlay(bpm, trackId, tracks, durationMultiplier)
      this.lastRecording = []
      this.micNode.start()
      this.isRecording = trackId
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
          const blob = new Blob(this.lastRecording, {type:'audio/mp3;'});
          this.lastRecording = []
          console.log(blob)
          const url = window.URL.createObjectURL(blob);
          console.log(url)
          const newRecording = {
            id: id,
            bufferData: new this.tonejs.ToneAudioBuffer(url),
            online: true,
          }
          newRecording.bufferData.onload = (b)=>{
            this.bufferPool.push(newRecording)
            console.log(this.bufferPool)
            resolve({id:id, duration:b.duration})
          }
        }
        
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
  transportPlay(bpm, omitTrackId, tracks, durationMultiplier){
   // if(this.actx === null) return;
    this.tonejs.bpm = bpm
    
    if(this.tonejs.Transport.state !== 'stopped'){
      this.transportStop()
      return;
    }
    const tt = durationMultiplier

    tracks.forEach(tr => {
      if(!tr.regions) return
      if(omitTrackId && tr.trackId === omitTrackId) return

      tr.regions.forEach(reg => {
        this.tonejs.Transport.schedule(t => {
            this.bufferPool.forEach(bp => {
              if(bp.id === reg.bufferId){
                tr.player.buffer = bp.bufferData
                tr.player.start(t, reg.bOffset*tt , reg.rDuration*tt )
              }
            })
            // tr.envelope.attack = reg.timeFadeIn
            // tr.envelope.release = reg.timeFadeOut
            // tr.envelope.triggerAttackRelease(reg.rDuration - reg.timeFadeOut)
        }, reg.rOffset*tt )
      })

    })

    // this.tonejs.Transport.scheduleRepeat(()=>{
    //   setTransportLabel(this.tonejs.Transport.position)
    // },'16n')
    let b = 0
    this.tonejs.Transport.scheduleRepeat((time)=>{
      if(this.metronome.mute) return
      if(b%4 === 0)
      this.metronome.click_major.start(time)
      else
      this.metronome.click_minor.start(time)

      b+=1
    }, '4n')
    
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
