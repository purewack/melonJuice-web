import { useState } from 'react';
import { createContext } from 'react';
import './App.css';
//import {AudioEngine} from './audio/AudioEngine';
import AudioField from './components/AudioField';
import AudioRegion from './components/AudioRegion';
import AudioTrack from './components/AudioTrack';

function App() {
  const [begun, setBegun] = useState(false)
  const [recording, setRecording] = useState(false)
  const [armedIndex,setArmedIndex] = useState(null)
  const [transportTimer, setTransportTimer] = useState('0:0:0')
  const [tracks, setTracks] = useState([1,2,3,2])
  const [regions, setRegions] = useState([1,1,1,1,1,1,1,1,1,1,1,1,1,1])
  const [zoom, setZoom] = useState(50)
  const [measures, setMeasures] = useState(16)

  return (
    <>  

      <div> <p><b>MelonJuice</b> is {recording ? 'recording' : 'ready'} </p> </div>
{/*           
      <button onClick={()=>{AudioEngine.monitor()}}>Monitor</button>
      <button style={{backgroundColor:(recording ? 'red' : 'gray')}} 
        onClick={()=>{
          setRecording(AudioEngine.transportRecord(armedIndex))
        }}
      >Record</button>
      <button onClick={()=>{
        AudioEngine.transportPlay(setTransport)
      }}>Playback</button>
        <button onClick={()=>{
    console.log(AudioEngine.tracks)}}>List</button> */}
    
      <AudioField timer={transportTimer} songMeasures={measures} zoom={zoom}>
        {tracks.map((t,i) => {
          return <AudioTrack key={i} id={i} armedId={armedIndex} onArm={()=>{
            setArmedIndex((armedIndex !== i ? i : null))
          }} zoom={zoom}>
            {regions && regions.map((r,j) => {
                return <AudioRegion key={j} zoom={zoom}/>
            })}
          </AudioTrack>
        })}
      </AudioField>
  </>);
}

export default App;

  // <> {!begun ? <button onClick={()=>{
  //   setBegun(AudioEngine.init())
  // }}>Begin</button> :

  // }</>