import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone'
import './App.css';
import AudioTrack from './components/AudioTrack';

const ac = new AudioContext()

function App() {
  const mediaRecorder = useRef(null)
  const mediaRecorderChunks = useRef([])  
  const [begun, setBegun] = useState(false)
  const [transport, setTransport] = useState('0:0:0')
  const [recording, setRecording] = useState(false)
  const [armedIndex,setArmedIndex] = useState(null)
  const [tracks, setTracks] = useState([])
  const micProcess = useRef(null)

  const addTrack = ()=>{
    setTracks(prev => 
      [...prev, {
        player: new Tone.Player().toDestination(),
        buffers: [],
      }]
    )
    console.log('added')
  }

  useEffect(()=> {

    if(begun){
      



      navigator.mediaDevices.getUserMedia({audio:true,video:false}).then(stream => {
        console.log('permission granted')
        
        const startWorklet = async ()=>{
          console.log('setup mic-processor worklet')
          let mikeNode = ac.createMediaStreamSource(stream);
          await ac.audioWorklet.addModule('mic-processor.js').then(()=>{
            micProcess.current = new AudioWorkletNode(ac, 'mic-processor')
            mikeNode.connect(micProcess.current)
          })
        }

        const startTone = async ()=>{
          Tone.setContext(ac)
          await Tone.start().then(()=>{
            console.log('started')
            console.log('start and clear tracks')
            setTracks([])
            addTrack()
            addTrack()
            addTrack()
            startWorklet()
          })
        }
        startTone()
        
        
        // mediaRecorder.current = new MediaRecorder(stream, {mimeType:'audio/webm'});
        // mediaRecorder.current.ondataavailable = (e)=>{
        //   if(e.data.size > 0) mediaRecorderChunks.current.push(e.data)
        //   //console.log(e)
        // }
        // mediaRecorder.current.onstart = (e)=>{
        //   console.log('started')
        //   mediaRecorderChunks.current = []
        // }
        //
        // mediaRecorder.current.onerror = (e)=>{
        //   console.log('error')
        // }
      })
    }

  },[begun])

  useEffect(()=>{
    if(mediaRecorder.current !== null){
      mediaRecorder.current.onstop = (e)=>{
        let source = URL.createObjectURL(new Blob(mediaRecorderChunks.current))
        console.log(source)

        let track = tracks[armedIndex]
        track.buffers.push(new Tone.ToneAudioBuffer(source, (buffer)=>{
          track.player.buffer = buffer
        }))
      }
    }
  },[armedIndex, tracks])

  const rollTransport = ()=>{
    Tone.Transport.stop()
    Tone.Transport.scheduleRepeat(t=>{
      setTransport(Tone.Transport.position)
    },'16n',0)
    Tone.Transport.seconds = 0
    Tone.Transport.start()
  }

  const recHandle = ()=>{
    if(armedIndex === null) return
    
    if(micProcess.current.onaudioprocess){
      //mediaRecorder.current.stop()
      micProcess.current.onaudioprocess = null
      setRecording(false)
    }
    else{
      playHandle()
      micProcess.current.onaudioprocess = (e)=>{
        console.log(e.inputBuffer);
      }
      //mediaRecorder.current.start(1000*1024/44100)
      setRecording(true)
    }
  }
  const stopHandle =()=>{
    if(Tone.Transport.state === 'started'){
      tracks.forEach(t=>{
        t.player.stop()
      })
      Tone.Transport.stop()
    }
  }
  const playHandle = ()=>{
    if(Tone.Transport.state !== 'started'){

      //start all tracks that have a recording
      Tone.Transport.cancel()
      console.log('start transport')
      tracks.forEach(t=>{
        if(t.player.loaded){
          Tone.Transport.scheduleOnce(()=>{
              t.player.start()
          },'0:0:0')
        }
      })
      rollTransport()
    }
    setRecording(false)
  }


  return (<> {!begun ? <button onClick={()=>{setBegun(true)}}>Begin</button> :
    <>
      <div> <p>MelonJuice</p> {recording ? 'recording' : 'ready'}</div>
      <button style={{backgroundColor:(recording ? 'red' : 'gray')}}onClick={recHandle}>Record</button>
      <button onClick={()=>{
        if(Tone.Transport.state === 'started'){
          stopHandle()
        }
        else{
          playHandle()
        }
      }}>Playback</button>
      <p>{transport}</p>
      
      {tracks.map((t,i) => {
        return <AudioTrack key={i} id={i} armedId={armedIndex} onArm={()=>{
          setArmedIndex((armedIndex !== i ? i : null))
        }}/>
      })}
    </>}
  </>);
}

/*

Mock structure

<App>
  <TransportControls>
    <button> To Previous Bar </button>
    <button> Play/Stop </button>
    <button> To Next Bar </button>
  </TransportControls>

  <MetronomeControls>
    <button> Toggle </button>
    <button> Count-in: {bars} </button>
    <slider> Volume </slider>
  </MetronomeControls>
  
  <AudioField {loopBegin:Tone.Time, loopEnd:Tone.Time}>
    <Track >
      <Clip />
      <Clip />
    </Track>
    <Track>
      <Clip />
    </Track>
    <Track>
      <Clip />
      <Clip />
      <Clip />
    </Track>
  </AudioField>
</App>

Components:
<Clip {buffer:VBuffer, offset:Tone.Time, start:Tone.Time, end:Tone.Time, fadein:Tone.Time, fadeout:Tone.Time, gain:float}/>
<Track {focus:bool, player:Tone.Player, volume:float, pan:float, muted:bool, icon:img, color:string}/>

VBuffer{
  bufferid:int,
  preview:img,
}

*/

export default App;
