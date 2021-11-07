// import './App.css';
// // eslint-disable-next-line
// import { useRef, useState, useEffect} from 'react';
// // eslint-disable-next-line
// import { createContext } from 'react';
// import newid from 'uniqid';
// import { AudioEngine } from './audio/AudioEngine';
// //import {AudioEngine} from './audio/AudioEngine';
// import AudioField from './components/AudioField';
// import AudioRegion from './components/AudioRegion';
// import AudioTrack from './components/AudioTrack';
// import ToolField from './components/ToolField';
// import TrackTool from './components/TrackTool';

// function App() {
//   // eslint-disable-next-line
//   const [begun, setBegun] = useState(false)
//   // eslint-disable-next-line
//   const [recording, setRecording] = useState(false)
//   // eslint-disable-next-line
//   const [armedIndex,setArmedIndex] = useState(null)
//   // eslint-disable-next-line
//   const [transportTimer, setTransportTimer] = useState('0:0:0')
//   // eslint-disable-next-line
//   const [bar, setBar] = useState(50)
//   // eslint-disable-next-line
//   const [snapGrain, setSnapGrain] = useState(null)
//   // eslint-disable-next-line
//   const [measures, setMeasures] = useState(16)
//   // eslint-disable-next-line
//   const [tracks, setTracks] = useState([])

//   useEffect(() => {
//     if(!begun){
//       AudioEngine.addTrack()
//       AudioEngine.addTrack()
//       AudioEngine.addTrack()

//       AudioEngine.tracks[0].addRegion(newid(),10,1)
//       AudioEngine.tracks[0].addRegion(newid(),0,2)
//       AudioEngine.tracks[0].addRegion(newid(),3,4)

//       AudioEngine.tracks[1].addRegion(newid(),0,2)
//       AudioEngine.tracks[1].addRegion(newid(),5,5)

//       AudioEngine.tracks[2].addRegion(newid(),1,10)

//       setBegun(true)
//       setTracks(AudioEngine.tracks)
//     }

//   }, [])

//   return (
//     <>  
//       <p>{drag ? 'drag' : 'none'}</p>
//       <div> <p><b>MelonJuice</b> is {recording ? 'recording' : 'ready'} </p> </div>
// {/*           
//       <button onClick={()=>{AudioEngine.monitor()}}>Monitor</button>
//       <button style={{backgroundColor:(recording ? 'red' : 'gray')}} 
//         onClick={()=>{
//           setRecording(AudioEngine.transportRecord(armedIndex))
//         }}
//       >Record</button>
//       <button onClick={()=>{
//         AudioEngine.transportPlay(setTransport)
//       }}>Playback</button>
//         <button onClick={()=>{
//     console.log(AudioEngine.tracks)}}>List</button> */}
//       <input 
//         type="range" 
//         min="20" 
//         max="400" 
//         defaultValue="90"
//         onChange={(e)=>{
//           let n = Number(e.target.value)
//           setBar(n)
//         }}
//       />

//       <button 
//         style={{width:100}}
//         onClick={()=>{
//           if(snapGrain === null){
//             setSnapGrain(2)
//           }
//           else if(snapGrain < 16){
//             setSnapGrain(snapGrain*2)
//           }
//           else(setSnapGrain(null))
//         }}>

//         {snapGrain ? 'Q:'+snapGrain : 'No-snap'}
//       </button>

//       <div className="EditorField">
//         <ToolField>
//           <div className='TransportTimer'>{transportTimer}</div>

//           {tracks.map((t,i) => {
//             return <TrackTool key={i} id={i} armedId={armedIndex} onArm={()=>{
//               setArmedIndex((armedIndex !== i ? i : null))
//             }} />
//           })}

//         </ToolField>

//         <AudioField songMeasures={measures} bar={bar}>

//           {tracks.map((t,i) => { 
//             return <AudioTrack key={i} bar={bar}>

//               {t.regions && t.regions.map((r,j) => {
//                   return <AudioRegion key={j} region={r} setRegion={(r)=>{
//                     AudioEngine.tracks[i].setRegion(r)
//                     setTracks([...AudioEngine.tracks])
//                     console.log('ttt')
//                   }} bar={bar} shouldSnap={snapGrain} mousePos={mousePos} mouseOffset={50}/>
//               })}

//             </AudioTrack> 
//           })}

//         </AudioField>
//       </div>
//   </>);
// }

// export default App;

//   // <> {!begun ? <button onClick={()=>{
//   //   setBegun(AudioEngine.init())
//   // }}>Begin</button> :

//   // }</>


import './App.css';
import { useState, useEffect} from 'react';
import newid from 'uniqid';
import { AudioEngine } from './audio/AudioEngine';
import AudioField from './components/AudioField';
import AudioRegion from './components/AudioRegion';
import AudioTrack from './components/AudioTrack';

function App() {

  const [begun, setBegun] = useState(false)
  const [bar, setBar] = useState(50)
  const [snapGrain, setSnapGrain] = useState(null)
  const [tracks, setTracks] = useState([])

  useEffect(() => {
    if(!begun) {
      let ttt = [
        AudioEngine.newTrack(),
        AudioEngine.newTrack(),
        AudioEngine.newTrack(),
      ]

      ttt[0].addRegion(newid(),10,1)
      ttt[0].addRegion(newid(),0,2)
      ttt[0].addRegion(newid(),3,4)

      ttt[1].addRegion(newid(),0,2)
      ttt[1].addRegion(newid(),5,5)

      ttt[2].addRegion(newid(),1,10)

      setTracks(ttt)
      console.log(ttt)
      setBegun(true)
    }
    
    return ()=>{
      setTracks(null)
      setBegun(false)
    }
  }, [])

  return (<>
    {!begun ? <p>Loading...</p> : 
    <> 
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

      <button 
        style={{width:100}}
        onClick={()=>{
          if(snapGrain === null){
            setSnapGrain(2)
          }
          else if(snapGrain < 16){
            setSnapGrain(snapGrain*2)
          }
          else(setSnapGrain(null))
        }}>

        {snapGrain ? 'Q:'+snapGrain : 'No-snap'}
      </button>

      <br/>

      <AudioField songMeasures={16} bar={bar}>

        {tracks.map((t,i) => { 
          return <AudioTrack key={i} bar={bar} regions={t.regions} setRegion={(newRegion)=>{
            console.log(newRegion)
          }}
          onRegionSelect={r => {
            console.log(r)
          }}/>
        })}

      </AudioField>
  </>
  }
  </>);
}

export default App;

  // <> {!begun ? <button onClick={()=>{
  //   setBegun(AudioEngine.init())
  // }}>Begin</button> :

  // }</>