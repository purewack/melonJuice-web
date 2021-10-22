import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone'
import './App.css';

function App() {
  const [begun, setBegun] = useState(false)
  const [transport, setTransport] = useState('0:0:0')
  const [recording, setRecording] = useState(false)
  const mediaRecorder = useRef(null)
  const chunkz = useRef([])
  const buffers = useRef([])
  const player = useRef(null)
  
  useEffect(()=> {

    if(begun){
      navigator.mediaDevices.getUserMedia({audio:true,video:false}).then(stream => {
        console.log('permission granted')
        
        mediaRecorder.current = new MediaRecorder(stream, {mimeType:'audio/webm'});
        mediaRecorder.current.ondataavailable = (e)=>{
          if(e.data.size > 0) chunkz.current.push(e.data)
          //console.log(e)
        }
        mediaRecorder.current.onstart = (e)=>{
          console.log('started')
          chunkz.current = []
        }
        mediaRecorder.current.onstop = (e)=>{
          let source = URL.createObjectURL(new Blob(chunkz.current))
          console.log(source)
          buffers.current.push(new Tone.ToneAudioBuffer(source, ()=>{
            if(!player.current){
              player.current = new Tone.Player(buffers.current[0]).toDestination()
            }
          }))
        }
        mediaRecorder.current.onerror = (e)=>{
          console.log('error')
        }
        console.log(mediaRecorder.current)
      })
      const startTone = async ()=>{
        await Tone.start()
      }
      startTone()
    }

  },[begun])

  const recHandle = ()=>{
    if(mediaRecorder.current.state === 'recording'){
      mediaRecorder.current.stop()
      setRecording(false)
    }
    else{
      mediaRecorder.current.start(1000*1024/44100)
      setRecording(true)
    }
  }
  const playHandle = ()=>{
    if(Tone.Transport.state === 'started'){
      Tone.Transport.stop()
      player.current.stop()
    }
    else{
      Tone.Transport.scheduleRepeat(t=>{
        setTransport(Tone.Transport.position)
      },'16n',0)
      Tone.Transport.scheduleOnce(()=>{
        Tone.Transport.stop()
      },'4:0:0')

      Tone.Transport.scheduleOnce(()=>{
        player.current.buffer = buffers.current[0]
        player.current.start()
      },'0:0:0')
      if(buffers.current.length > 1){
        Tone.Transport.scheduleOnce(()=>{
          player.current.buffer = buffers.current[1]
          player.current.start()
        },'2:0:0')
      }

      Tone.Transport.seconds = 0
      Tone.Transport.start()
    }
    setRecording(false)
  }

  return (<> {!begun ? <button onClick={()=>{setBegun(true)}}>Begin</button> :
    <>
      <div> <p>BeatRoot</p> {recording ? 'recording' : 'ready'}</div>
      <button onClick={recHandle}>Record</button>
      <button onClick={playHandle}>Playback</button>
      <p>{transport}</p>
      <p>Buffers {buffers.current.length}</p>
    </>}
  </>);
}

export default App;
