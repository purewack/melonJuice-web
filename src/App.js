import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone'
import './App.css';

function App() {
  const [recording, setRecording] = useState(false)
  const mediaRecorder = useRef(null)
  const chunkz = useRef([])
  const player = useRef(null)
  const aud = useRef(null)
  
  useEffect(()=>{
    navigator.mediaDevices.getUserMedia({audio:true,video:false}).then(stream => {
      console.log('permission granted')
      
      mediaRecorder.current = new MediaRecorder(stream, {mimeType:'audio/webm'});
      mediaRecorder.current.ondataavailable = (e)=>{
        if(e.data.size > 0) chunkz.current.push(e.data)
      }
      mediaRecorder.current.onstart = (e)=>{
        console.log('started')
        chunkz.current = []
      }
      mediaRecorder.current.onstop = (e)=>{
        let source = URL.createObjectURL(new Blob(chunkz.current))
        console.log(source)
        player.current = new Tone.Player(source).toDestination()
        player.current.autostart = true
      }
      mediaRecorder.current.onerror = (e)=>{
        console.log('error')
      }
      console.log(mediaRecorder.current)
    })
  },[])

  const recHandle = ()=>{
    setRecording(true)
    mediaRecorder.current.start()
  }
  const playHandle = ()=>{
    setRecording(false)
    if(mediaRecorder.current.state === 'recording'){
    mediaRecorder.current.stop()
    }
    else{
    player.current.start(0)
    }
  }

  return (<>
    <p> Simple DAW {recording ? 'recording' : 'ready'}</p>
    <button onClick={recHandle}>Record</button>
    <button onClick={playHandle}>Playback</button>
    <audio ><source ref={aud} src='' type='audio/mpeg'/>Output</audio>
  </>);
}

export default App;
