import { useEffect, useState } from 'react';
import './App.css';
import AudioTrack from './components/AudioTrack';
import {AudioEngine} from './audio/AudioEngine';

function App() {
  const [begun, setBegun] = useState(false)
  const [armedIndex,setArmedIndex] = useState(null)
  const [transport, setTransport] = useState('0:0:0')
  const [recording, setRecording] = useState(false)
  const [tracks, setTracks] = useState([1,2,3])


  return (<> {!begun ? <button onClick={()=>{
    setBegun(true)
    AudioEngine.init()
  }}>Begin</button> :
    <>
      <div> <p>MelonJuice</p> {recording ? 'recording' : 'ready'}</div>
      <button style={{backgroundColor:(recording ? 'red' : 'gray')}} 
        onClick={()=>{
          setRecording(AudioEngine.record())
        }}
      >Record</button>
      <button onClick={()=>{
        AudioEngine.transportPlay()
      }}>Playback</button>
      <p>{transport}</p>
      <a href={AudioEngine.lastURL} download={'wau.wav'}>get</a>
      
      {tracks.map((t,i) => {
        return <AudioTrack key={i} id={i} armedId={armedIndex} onArm={()=>{
          setArmedIndex((armedIndex !== i ? i : null))
        }}/>
      })}
    </>}
  </>);
}

export default App;
