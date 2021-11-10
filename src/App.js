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
import { useState, useEffect, useReducer, useRef} from 'react';
import newid from 'uniqid';
import { AudioEngine } from './audio/AudioEngine';
import AudioField from './components/AudioField';
import AudioTrack from './components/AudioTrack';

function tracksReducer(state,action){
  switch(action.type){
    case 'new':
      return {current: [AudioEngine.newTrack()], history: [[]], historyPointer:0}

    case 'load':
      return {current: [...action.tracks], history: [[...action.tracks]], historyPointer:0}

    case 'update_region':
      const currentCopy = state.current.map(t => {
        return {...t, regions:[...t.regions]}
      })

      const newMove = currentCopy.map(t => {
        let outputTrack = t
        t.regions.forEach(r => {
          if(r.regionId === action.updatedRegion.regionId){
            outputTrack.regions = AudioEngine.updateRegion(outputTrack.regions, action.updatedRegion)
          }
        }) 
        return outputTrack
      })

      if(state.historyPointer !== state.history.length-1){
        //console.log(state.history.slice(0,state.historyPointer+1))
        return {
          historyPointer: state.historyPointer+1,
          history:  [...state.history.slice(0,state.historyPointer+1), newMove],
          current: newMove,
        }
      }

      return {
        historyPointer: state.historyPointer+1,
        history:  [...state.history, newMove],
        current: newMove,
      }
    
    case 'undo':
      if(state.historyPointer > 0){
        return {
          ...state,
          current: state.history[state.historyPointer-1],
          historyPointer: state.historyPointer-1,
        }
      }
      break;
    case 'redo':
      if(state.historyPointer < state.history.length-1){
        return {
          ...state,
          current: state.history[state.historyPointer+1],
          historyPointer: state.historyPointer+1,
        }
      }
      break;
      
    default:
      return state;
  }
}

function App() {

  const [begun, setBegun] = useState(false)
  const [songMeasures, setSongMeasures] = useState(16)
  const [editorStats, setEditorStats] = useState({snapGrain:null, barLength:50})
  const [tracks, tracksDispatch] = useReducer(tracksReducer)
  const [songTitle, setSongTitle] = useState('')
  const undoButtonRef = useRef()
  const redoButtonRef = useRef()

  useEffect(() => {
    if(!begun) {
      let ttt = [
        AudioEngine.newTrack(),
        AudioEngine.newTrack(),
        AudioEngine.newTrack(),
      ]

      ttt[0].regions = AudioEngine.setRegions([
        AudioEngine.newRegion(newid(),10,1),
        AudioEngine.newRegion(newid(),0,2),
        AudioEngine.newRegion(newid(),3,4),
      ])

      ttt[1].regions =  AudioEngine.setRegions([
        AudioEngine.newRegion(newid(),0,2),
        AudioEngine.newRegion(newid(),5,5),
      ])

      ttt[2].regions =  AudioEngine.setRegions([
        AudioEngine.newRegion(newid(),1,10),
      ])

      tracksDispatch({type:'load', tracks:ttt})
      setSongTitle('test_init_regions')
      setBegun(true)
    }
    
  }, [begun])

  useEffect(()=>{
    if(!begun) return
    // console.log('song changed')
    // console.log(tracks)

    let sm = 0
    tracks.current.forEach(t => {
      if(t.regions.length){
        const r = t.regions[t.regions.length-1]
        const d = r.rStart + r.rDuration
        if(d > sm) sm = d
      }
    })
    setSongMeasures(Math.floor(sm + 4))

    undoButtonRef.current.disabled = (tracks.historyPointer < 1)
    redoButtonRef.current.disabled = (tracks.historyPointer === tracks.history.length-1)
  },[tracks,begun])

  return (<>
    {!begun ? <p>Loading...</p> : 
    <> 
      <p>{songTitle}</p>

      <button ref={undoButtonRef} onClick={()=>{tracksDispatch({type:'undo'})}}>Undo</button>
      <button ref={redoButtonRef} onClick={()=>{tracksDispatch({type:'redo'})}}>Redo</button>

      <input 
        type="range" 
        min="20" 
        max="400" 
        defaultValue="90"
        onChange={(e)=>{
          setEditorStats({
            ...editorStats, 
            barLength:Number(e.target.value)
          })
        }}
      />

      <button onClick={()=>{
        tracksDispatch({type:'new'})
        setSongTitle('untitled')
      }}> New... </button>

      <button 
        style={{width:100}}
        onClick={()=>{
          let snap = editorStats.snapGrain
          if(snap === null){
            setEditorStats({...editorStats, snapGrain:2})
          }
          else if(snap < 16){
            setEditorStats({...editorStats, snapGrain:snap*2})
          }
          else{
            setEditorStats({...editorStats, snapGrain:null})
          }
        }}>

        {editorStats.snapGrain ? 'Q:'+editorStats.snapGrain : 'No-snap'}
      </button>

      <br/>

      <AudioField songMeasures={songMeasures ? songMeasures : 16} editorStats={editorStats}>
        {tracks.current.map((track,i) => { 
          return <AudioTrack key={i} regions={track.regions} tracksDispatch={tracksDispatch} editorStats={editorStats}/>
        })}
      </AudioField>
  </>
  }
  </>);
}

export default App;
