import { useState } from 'react';
import './App.css';
import AudioTrackControls from './components/AudioTrackControls';
import {AudioEngine} from './audio/AudioEngine';

function App() {
  const [begun, setBegun] = useState(false)
  const [recording, setRecording] = useState(false)
  const [armedIndex,setArmedIndex] = useState(null)
  // eslint-disable-next-line 
  const [transport, setTransport] = useState('0:0:0')
  // eslint-disable-next-line 
  const [tracks, setTracks] = useState([1,2,3])
  

  return (<> {!begun ? <button onClick={()=>{
    setBegun(AudioEngine.init())
  }}>Begin</button> :
    <>
      <div> <p>MelonJuice</p> {recording ? 'recording' : 'ready'}</div>
      <p>{transport}</p>
          
      <button onClick={()=>{AudioEngine.monitor()}}>Monitor</button>
      <button style={{backgroundColor:(recording ? 'red' : 'gray')}} 
        onClick={()=>{
          setRecording(AudioEngine.record(armedIndex))
        }}
      >Record</button>
      <button onClick={()=>{
        AudioEngine.transportPlay(setTransport)
      }}>Playback</button>
        <button onClick={()=>{
    console.log(AudioEngine.tracks)}}>List</button>
      
      {tracks.map((t,i) => {
        return <AudioTrackControls key={i} id={i} armedId={armedIndex} onArm={()=>{
          setArmedIndex((armedIndex !== i ? i : null))
        }}/>
      })}
    </>}
  </>);
}

export default App;
