import './css/App.css';
import './css/Fields.css'
import './css/Time.css'
import { useState, useEffect, useReducer, useRef} from 'react';

import newid from 'uniqid';
import { AudioEngine } from './audio/AudioEngine';
import AudioField from './components/AudioField';
import AudioTrack from './components/AudioTrack';
import AudioRegion from './components/AudioRegion';
import { tracksReducer } from './reducers/TracksReducer'
import ToolField from './components/ToolField';
import TrackTool from './components/TrackTool';
import SVGElements from './gfx/SVGElements';
import JSZip from 'jszip';
import download from 'downloadjs';
import encodeWAV from 'audiobuffer-to-wav'

function App() {

  const [screen, setScreen] = useState(false)
  const [songMeasures, setSongMeasures] = useState(16)
  const [editorStats, setEditorStats] = useState({snapGrain:null, barLength:150, trackHeight:100, toolMode:'grab'})
  const [tracks, tracksDispatch] = useReducer(tracksReducer)
  const [songTitle, setSongTitle] = useState('')
  //eslint-disable-next-line
  const [bpm, setBpm] = useState(110)
  const [durationMultiplier, setDurationMultiplier] = useState(1.0)
  //eslint-disable-next-line
  const [clickState, setClickState] = useState(false)
  const undoButtonRef = useRef()
  const redoButtonRef = useRef()
  const [armedId, setArmedId] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
  
  //eslint-disable-next-line
  const [recStart, setRecStart] = useState(0)
  const [recEnd, setRecEnd] = useState(0)
  
  const [inputDevices, setInputDevices] = useState()
  const [selectedInput, setSelectedInput] = useState(null)
  //const [useMicrophone, setUseMicrophone] = useState()

  useEffect(() => {
    if(screen === 'audio-permissions') {

      AudioEngine.hasInputs().then(()=>{
        try{
          AudioEngine.awaitPermission().then(()=>{
            console.log('got permissions')
            AudioEngine.getInputs().then((devices)=>{  
              console.log('new')
              console.log(devices)
              setSongTitle('Unnamed')
              setInputDevices(devices)
              setScreen('audio-devices')
            })
          }).catch(()=>{
            console.log('not allowed')
            setScreen('audio-denied')
          })
        }
        catch(ex){
          console.log(ex)
          setScreen('audio-ex')
        }
      }).catch(()=>{
        setScreen('audio-nodevices')
        setSelectedInput(null)
      })
    }

    else if(screen === 'editor-fresh'){

      // const testId = newid()
      // const testSrc = 'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_1MG.mp3'
      // //const testSrc = 'https://file-examples-com.github.io/uploads/2017/11/file_example_WAV_1MG.wav'            
      // const testBuffer = {
      //   id: testId,
      //   bufferData: new AudioEngine.tonejs.ToneAudioBuffer(testSrc),
      //   online: true,
      // }
      // let testRegion = AudioEngine.newRegion(testId,0,0)
      
      // testBuffer.bufferData.onload = (buf) => {
        
      //   testRegion.rDuration = testRegion.bDuration
      //   AudioEngine.bufferPool.push(testBuffer)
        
      //   let ttt = [
      //     AudioEngine.newTrack(),
      //     AudioEngine.newTrack(),
      //     AudioEngine.newTrack(),
      //   ]

      //   ttt[0].regions = AudioEngine.setRegions([
      //     testRegion,
      //     // AudioEngine.newRegion(newid(),10,1),
      //     // AudioEngine.newRegion(newid(),0,2),
      //     // AudioEngine.newRegion(newid(),3,4),
      //     AudioEngine.newRegion(newid(),15,20),
      //   ])

      //   ttt[1].regions =  AudioEngine.setRegions([
      //     AudioEngine.newRegion(newid(),0,2),
      //     AudioEngine.newRegion(newid(),5,5),
      //   ])

      //   ttt[2].regions =  AudioEngine.setRegions([
      //     AudioEngine.newRegion(newid(),1,10),
      //   ])

      //   tracksDispatch({type:'load', tracks:ttt})
      //   setSongTitle('test_init_regions')
      //   setScreen('editor')
      // }
      AudioEngine.init(selectedInput)
      tracksDispatch({type:'new'})
      setScreen('editor')
    }
  //eslint-disable-next-line
  }, [screen])

  useEffect(()=>{
    if(!screen) return
    if(screen !== 'editor') return

    console.log('song changed')
    console.log(tracks)
    //setEditorStats({...editorStats,lastMoveLegal:tracks.lastMoveLegal})
 
 
    //calc song length based on longest most further away clip
    let sm = 0
    tracks.current.forEach(t => {
      if(t.regions.length){
        const r = t.regions[t.regions.length-1]
        const d = r.rOffset + r.rDuration
        if(d > sm) sm = d
      }
    })
    setSongMeasures(Math.floor(sm + 4))

    undoButtonRef.current.disabled = (tracks.historyPointer < 1)
    redoButtonRef.current.disabled = (tracks.historyPointer === tracks.history.length-1)
  },[tracks,screen])

  useEffect(()=>{
    const bps = bpm/60
    const beatDurSec = 1/bps
    const barDurSec = 4*beatDurSec
    console.log({bpm,bps,beatDurSec,barDurSec})
    setDurationMultiplier(1/barDurSec)
  },[bpm, screen])

  // useEffect(()=>{ 
  //   console.log(editorStats.toolMode)
  //   if(tracks)
  //   tracks.changes = tracks.changes.map(t => {return true})
  // },[editorStats])

  const startAudio = ()=>{
   // AudioEngine.init(selectedInput)
  }

  return (<>
    {!screen ? <>
      <p>Welcome to MelonJuice</p>
      <button onClick={()=>{
        setScreen('audio-permissions')
      }}>Start</button>
    </> :

    screen === 'audio-permissions' ? <p>Waiting for permissions...</p> :

    screen === 'audio-denied' ? <>
      <p>🔇 Audio permissions denied 😭</p> 
      <button onClick={()=>{
        startAudio()
        setScreen('editor-fresh')
      }}>Continue without input</button>
    </>:

    screen === 'audio-nodevices' ? <>
      <p>Looks like you don't have any input devices :/</p>
      <button onClick={()=>{
        startAudio()
        setScreen('editor-fresh')
      }}> Continue</button>
    </> :
      
    screen === 'audio-devices' ? <>
      {inputDevices && inputDevices.map(d => {
        if(d.kind === 'audioinput' && !(d.deviceId === 'communications' || d.deviceId === 'default'))
          return( 
            <p key={d.deviceId+d.groupId} onClick={()=>{
              setSelectedInput(d.deviceId)
            }}> {selectedInput === d.deviceId ? '✔️' : null} 🎤 - {d.label}</p>
          )
        else
          return null
      })} 
      
      <button disabled={!selectedInput} onClick={()=>{
        startAudio()
        setScreen('editor-fresh')
      }}>
        {selectedInput ? 'Use this one' : 'Click one from the list'}
      </button>
    </> : 

    screen === 'editor-fresh' ? <>
      <p>Loading ...</p>
    </>:

    screen === 'editor' ?
    <>


    <button onClick={()=>{
      AudioEngine.transportPlay(bpm, null, tracks.current, durationMultiplier)
    }}>Start</button>

    <button onClick={()=>{
      AudioEngine.transportStop(tracks.current)}
    }>Stop</button>
    
    <button onClick={()=>{
      AudioEngine.transportRecordStart(bpm, armedId, tracks.current, durationMultiplier)
    }}>Rec Start</button>

    <button onClick={()=>{
      AudioEngine.transportRecordStop(armedId, tracks.current).then((recording)=>{
        const rr = AudioEngine.newRegion(recording.id, 0, recording.duration)
        tracksDispatch({type:'record_region', trackId: armedId, region: rr})
      })
    }}>Rec Stop</button>

    <SVGElements buffers={AudioEngine.bufferPool}/>

      <button onClick={()=>{
        const project = {
          version: 0.1, 
          title:songTitle, 
          metroBpm: bpm,
          metroActive: clickState,
          sources: AudioEngine.bufferPool.map(b => {
            return b.id
          }),
          tracks: tracks.current}
        const manifest = JSON.stringify(project)
        let pzip = JSZip()
        let sources = pzip.folder('sources')

        AudioEngine.bufferPool.forEach(b => {
          const ab = encodeWAV(b.bufferData._buffer)
          sources.file(`buffer_${b.id}.wav`,ab)
        })

        pzip.file(`${songTitle}`,manifest)
        pzip.generateAsync({type:'blob'}).then(
          (content) => {
            download(content,`${songTitle}.zip`, 'application/zip')
          }
        )
      }}>
        Save
      </button>

    <div className="Editor"> 
    
      <div className='ControlField'>
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

        {/* <button onClick={()=>{
          tracksDispatch({type:'new'})
          setSongTitle('untitled')
        }}> New... </button> */}

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



        <form>
          <label>
            <input type="radio" value="grab" 
              checked={(editorStats.toolMode === 'grab')} 
              onChange={e=>{
                setEditorStats({
                  ...editorStats, 
                  toolMode: e.target.value,
                })
              }}/>
            🖐
          </label>
          <label>
            <input type="radio" value="fade" 
              checked={(editorStats.toolMode === 'fade')} 
              onChange={e=>{
                setEditorStats({
                  ...editorStats, 
                  toolMode: e.target.value,
                })
              }}/>
            🌗
          </label>
          <label>
            <input type="radio" value="cut" 
              checked={(editorStats.toolMode === 'cut')} 
              onChange={e=>{
                setEditorStats({
                  ...editorStats, 
                  toolMode: e.target.value,
                })
              }}/>
            ✂️
          </label>
        </form>

        <br/>

        <form onSubmit={e=>{
          e.preventDefault()
          if(armedId && (recEnd > recStart)){
            const testId = newid()
            const testSrc = 'https://file-examples-com.github.io/uploads/2017/11/file_example_WAV_1MG.wav'
            const testBuffer = {
              id: testId,
              bufferData: new AudioEngine.tonejs.ToneAudioBuffer(testSrc),
            }
            let testRegion = AudioEngine.newRegion(testId,Number(recStart),recEnd-recStart)
            
            const doneLoad = (buf) => {
              const bpm = 110
              const bps = bpm/60
              const beatDurSec = 1/bps
              const barDurSec = 4*beatDurSec
              console.log({bpm,bps,beatDurSec,barDurSec})
              console.log(buf)
              testRegion.bDuration = buf._buffer.duration / barDurSec
              AudioEngine.bufferPool.push(testBuffer)
              console.log(AudioEngine.bufferPool)

              tracksDispatch({type:'record_region', trackId:armedId, region:testRegion})
            }
            testBuffer.bufferData.onload = doneLoad
          }
        }}>
          <label>
            Record Start
            <input type='number' value={recStart} onChange={e=>{setRecStart(Number(e.target.value))}}/>
          </label>
          <br/>

          <label>
            Record End
            <input type='number' value={recEnd} onChange={e=>{setRecEnd(Number(e.target.value))}}/>
          </label>
          <br/>

          <input type="submit" value="Sim. Record" />
          <br/>
        </form>
      </div>

      <div className="EditorField">
        <ToolField>
          <p className="TransportTimer">Timer</p>
          {tracks.current.map(t=>{
            return <TrackTool key={t.trackId} onArm={
              ()=>{
                if(armedId === t.trackId) setArmedId(null)
                else setArmedId(t.trackId)
              }
            } height={editorStats.trackHeight}/>
          })}
        </ToolField>

        <AudioField songMeasures={songMeasures ? songMeasures : 16} editorStats={editorStats}>
          {tracks.current.map((track,i,tt) => { 
            return <AudioTrack 
              hadChanges={tracks.changes[i]}
              key={track.trackId} 
              id={track.trackId} 
              armedId={armedId}
              editorStats={editorStats}
            >
              {track.regions.map( r => {
                let path
                AudioEngine.bufferPool.forEach(b =>{
                  if(b.id === r.bufferId) path = b.svgWaveformPath
                })

                return <AudioRegion
                    key={r.regionId} 
                    region={r}
                    selectedRegion={selectedRegion}
                    onSelect={(r)=>{
                      setSelectedRegion(r)
                    }}
                    waveformPath={path}
                    trackInfo={{idx:i, max:tt.length, color:track.color}}
                    tracksDispatch={tracksDispatch}
                    editorStats={editorStats}
                />
              })}
              </AudioTrack>
          })}
        </AudioField>
      </div>
      
      <p>Debug Map</p>
        
      {selectedRegion ? 
      tracks.current.map(t => {
          return t.regions.map(r => {
            if(r.regionId === selectedRegion.regionId){
              return <div key={r.regionId} className='DebugSelection'>
                <p>regionId:{r.regionId}</p>
                <p>bufferId:{r.bufferId}</p>
                <p>bOffset:{r.bOffset}</p>
                <p>bDuration:{r.bDuration}</p>
                <p>rOffset:{r.rOffset}</p>
                <p>rDuration:{r.rDuration}</p>
                <p>rFadeIn:{r.rFadeIn}</p>
                <p>rFadeOut:{r.rFadeOut}</p>
              </div> 
            }
            else 
            return null
          })
        })
      : null}

      {/* <div className="DebugMap">
        <div>
          <p>Buffers</p>
          {buffers.map(b => {
            return <div key={b.bufferId} className="DebugBuffer">
              ID:<b>{b.bufferId}</b> - Duration: <b>{b.duration}</b>
            </div>
          })}
        </div>

        <div>
          <p>Regions</p>
          {tracks.current.map(t=>{
            
            return <div key={t.trackId} className="DebugTrack">
              <p>TrackID: {t.trackId}</p>
              {t.regions.map(r => {
                return <div key={r.regionId} className="DebugRegion">
                  ID:<b>{r.regionId}</b> -
                  Start:<b>{r.rOffset}</b> -
                  End:<b>{r.rDuration+r.rOffset}</b> -
                  Duration:<b>{r.rDuration}</b> -
                  BufferOffset:<b>{r.bOffset}</b> -
                  BufferID:<b>{r.bufferId}</b>
                  
                </div>
              })}
            </div>
          })}
        </div>
      </div> */}
  </div>
  </> : null
  }
  </>);
}

export default App;
