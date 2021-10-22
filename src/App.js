import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone'
import './App.css';

function App() {
  const [begun, setBegun] = useState(false)
  const [transport, setTransport] = useState('0:0:0')
  const [recording, setRecording] = useState(false)
  const mediaRecorder = useRef(null)
  const chunkz = useRef([])
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
          player.current = new Tone.Player(source).toDestination().sync().start('1:0:0')
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
    }
    else{
      Tone.Transport.seconds = 0
      Tone.Transport.start().scheduleRepeat(transport=>{
        setTransport(Tone.Transport.position)
      },'16n',0)
    }
    setRecording(false)
  }

  return (<> {!begun ? <button onClick={()=>{setBegun(true)}}>Begin</button> :
    <>
    <p> Simple DAW - {recording ? 'recording' : 'ready'}</p>
    <button onClick={recHandle}>Record</button>
    <button onClick={playHandle}>Playback</button>
    <p>{transport}</p>
    </>}
  </>);
}

export default App;
