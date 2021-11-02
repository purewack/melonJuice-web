import { useRef, useState } from 'react';
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
  const [bar, setBar] = useState(50)
  const [snapGrain, setSnapGrain] = useState(null)
  const [measures, setMeasures] = useState(16)
  const [regions, setRegions] = useState([
    {
      bufferId: 1,
      timeBufferOffset:0,
      timeStart:0,
      timeDuration:2,
    },
    {
      bufferId: 2,
      timeBufferOffset:0,
      timeStart:3,
      timeDuration:1,
    },
    {
      bufferId: 3,
      timeBufferOffset:0,
      timeStart:4,
      timeDuration:4,
    }
  ])

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
      <input 
        type="range" 
        min="20" 
        max="400" 
        defaultValue="90"
        onChange={(e)=>{
          let n = Number(e.target.value)
          setBar(n)
        }}
      />

      <button onClick={()=>{
        if(snapGrain === null){
          setSnapGrain(1)
        }
        else if(snapGrain < 16){
          setSnapGrain(snapGrain*2)
        }
        else(setSnapGrain(null))
      }}>
        {snapGrain ? 'Q:'+snapGrain : 'No-snap'}
      </button>

      <AudioField timer={transportTimer} songMeasures={measures} bar={bar}>
        {tracks.map((t,i) => {

          return <AudioTrack key={i} id={i} armedId={armedIndex} onArm={()=>{
            setArmedIndex((armedIndex !== i ? i : null))
          }} bar={bar}>

            {regions && regions.map((r,j) => {
                return <AudioRegion key={j} region={r} bar={bar} shouldSnap={snapGrain}/>
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