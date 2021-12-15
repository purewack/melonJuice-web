import '../css/AudioRegion.css';
import {useState,useEffect,useRef,useCallback} from 'react'
import PointerHandle  from '../interfaces/PointerHandle';
//import{useRenders} from '../Util'

    /*      
                               │                    │
                               ├──────rDur──────────┤
        │                      │                    │
        ├─────────roff─────────┤
        │                      │
        │              ┌-------┼────────────────────┐
        │              │       │                    │
        │              │       │                    │
        │              └-------┼────────────────────┘
                               │
                       │       │                    │
                       │boff───┘                    │
                       │                            │
                       ├─bdur───────────────────────┤
                       │                            │
    */

const AudioRegion = ({region, selectedRegion, onSelect, trackInfo, tracksDispatch, editorStats})=>{
  const rOffset = (editorStats.barLength*region.rOffset)
  const rDuration = (editorStats.barLength*region.rDuration)
  const bOffset = (editorStats.barLength*region.bOffset)
  const bDuration = (editorStats.barLength*region.bDuration)
  const rFadeIn = (editorStats.barLength*region.rFadeIn)
  const rFadeOut = (editorStats.barLength*region.rFadeOut)
  const maxHeight = (editorStats.trackHeight)
  const selected = selectedRegion && selectedRegion.regionId === region.regionId
  const isGrabbing = editorStats.toolMode === 'grab'
  const isFading = editorStats.toolMode === 'fade'
  const isCutting = editorStats.toolMode === 'cut'

  const snapVCalc = (ll)=>{
    let b = (maxHeight)
    let l = Math.floor(ll/b)*b
    return l;
  }
  const snapCalc = (ll, min, max, cancel)=>{
    if(editorStats.snapGrain && !cancel){
      let b = (editorStats.barLength/editorStats.snapGrain)
      let l = Math.floor(ll/b)*b
      if(min !== null && l < min) l = min
      if(max !== null && l > max) l = max
     return l;
    }
    return ll
  }
  const selectHandler = ()=>{
      resetCutPos()
    if(selectedRegion)
    onSelect(null)
    else{
      onSelect(region)
    }
  } 
  const [rrDuration, setRRDuration] = useState(0)
  const [rrOffset, setRROffset] = useState(0)
  const [rrFadeIn, setRRFadeIn] = useState(0)
  const [rrFadeOut, setRRFadeOut] = useState(0)
  const [rrTransform, setRRTransform] = useState(0)
  const [cutHandleTransform, setCutHandleTransform] = useState(0)
  const [cutHandleLineTransform, setCutHandleLineTransform] = useState(0)
  const cutHandleDxx = useRef(0)
  const [cutPos, setCutPos] = useState(0)
  const [pointerState, setPointerState] = useState('')


  const onStartResizeHandler = ()=>{
    setPointerState('resize-change')
  }
  const onStartMoveChange = ()=>{
    setPointerState('move-change')
  }

  const onChangeDurationHandler = ({dx})=>{
    const left = rOffset
    const right = left+rDuration
    let dxx = snapCalc(dx)-(right - snapCalc(right))
    const max = (bDuration-bOffset)-rDuration
    if(dx === max) dxx = max 
    console.log({dxx,rDuration,crdur:snapCalc(rDuration)})
    setRRDuration(dxx)
  }
  const onEndDurationHandler = ({dx})=>{
    setPointerState('')
    if(dx === 0) return
      const left = rOffset
      const right = left+rDuration
      let dxx = snapCalc(dx)-(right - snapCalc(right))
      const max = (bDuration-bOffset)-rDuration
      if(dx === max) dxx = max 
      const rd = (rDuration + dxx)/editorStats.barLength
      tracksDispatch({
       type:'update_region',
       updatedRegion: {...region, rDuration:rd},
       jumpRelativeTracks:0,
      })
  }

  const onChangeOffsetHandler = ({dx})=>{
    let dxx = snapCalc(dx)-(rOffset - snapCalc(rOffset))
    if(dxx <= -bOffset) dxx = -bOffset
    setRROffset(dxx)
    setRRDuration(-dxx)
    console.log({dxx, dddd:0})
    setRRTransform(`translateX(${dxx}px)`)
  }
  const onEndOffsetHandler = ({dx})=>{
    setPointerState('')
    if(dx === 0) return
      let dxx = snapCalc(dx)-(rOffset - snapCalc(rOffset))
      if(dxx <= -bOffset) dxx = -bOffset
      const ro = (rOffset + dxx)/editorStats.barLength
      const rd = (rDuration - dxx)/editorStats.barLength
      const bo = (bOffset + dxx)/editorStats.barLength
      tracksDispatch({
       type:'update_region',
       updatedRegion: {...region, bOffset:bo, rOffset:ro, rDuration:rd},
       jumpRelativeTracks:0,
      })
  }

  const onChangeGrabHandler = ({dx, dy})=>{
    const dxx = snapCalc(dx)-(rOffset - snapCalc(rOffset))
    setRRTransform(`translateX(${dxx}px) translateY(${snapVCalc(dy + editorStats.trackHeight/2)}px)`)
  }
  const onEndGrabHandler = ({dx, dy})=>{
    setPointerState('')
    if(dx === 0) return

    const jumps = (snapVCalc(dy + editorStats.trackHeight/2)/editorStats.trackHeight)
    const dxx = snapCalc(dx)-(rOffset - snapCalc(rOffset))
    const ro = (rOffset + dxx)/editorStats.barLength
      tracksDispatch({
       type:'update_region',
       updatedRegion: {...region, rOffset:ro},
       jumpRelativeTracks:jumps,
      })
  }

  const resetCutPos = ()=>{
    setCutPos(rDuration/2)
    setCutHandleTransform(`translate(${rDuration/2},0)`)
    setCutHandleLineTransform(`translate(${rDuration/2},0)`)
  }
  const onChangeCutHandler = ({dx, dy, prev_dy})=>{
    if(dy+15 < -editorStats.trackHeight) return

    const max = rDuration-cutPos;
    let dxx = snapCalc(rOffset + cutPos + dx) - rOffset//snapCalc(dx)-(rOffset - snapCalc(rOffset))
    if(dxx < 0) dxx = 0
    else if(dx === max) dxx = rDuration

    const cutBonudary = -20
    if(dy > cutBonudary) cutHandleDxx.current = dxx
    const th = `translate(${cutHandleDxx.current}, ${dy <= cutBonudary ? dy : 0})`
    const thl = `translate(${cutHandleDxx.current}, 0)`
    setCutHandleTransform(th)
    setCutHandleLineTransform(thl)

    if(editorStats.trackHeight+dy <= 0 && editorStats.trackHeight+prev_dy > 0) {
      if(dxx === 0 || dxx === rDuration) return
      const cp = dxx
      const cutPosCommit = (cp/editorStats.barLength)
      onSelect(null)
      tracksDispatch({type:'cut_region',regionToCut:region,regionCutLength:cutPosCommit})
    }
  }
  const onEndCutHandler = ({dx,dy}) => {
    const max = rDuration-cutPos;
    let dxx = snapCalc(rOffset + cutPos + dx) - rOffset//snapCalc(dx)-(rOffset - snapCalc(rOffset))
    if(dxx < 0) dxx = 0
    else if(dx === max) dxx = rDuration
    
    setCutPos(dxx)
    const th = `translate(${dxx}, 0)`
    const thl = th
    setCutHandleTransform(th)
    setCutHandleLineTransform(thl)
  }

 
  const onChangeFadeInHandler = ({dx})=>{
    setRRFadeIn(dx)
  }
  const onEndFadeInHandler = ({dx})=>{
    const rfi = (rFadeIn+dx)/editorStats.barLength
    tracksDispatch({
      type:'update_region',
      updatedRegion: {...region, rFadeIn:rfi},
      jumpRelativeTracks:0,
    })
  }

  const onChangeFadeOutHandler = ({dx})=>{
    setRRFadeOut(-dx)
  }
  const onEndFadeOutHandler = ({dx})=>{
    const rfo = (rFadeOut-dx)/editorStats.barLength
    tracksDispatch({
      type:'update_region',
      updatedRegion: {...region, rFadeOut:rfo},
      jumpRelativeTracks:0,
    })
  }

  useEffect(()=>{
    setRRDuration(0)
    setRROffset(0)
    setRRFadeIn(0)
    setRRFadeOut(0)
    setRRTransform('')
    setPointerState('')
    resetCutPos()
  },[region])
  
  const styleRegion = {
    left: rOffset,
    transform: rrTransform,
  } 

  const rww = rDuration + rrDuration;
 
  return(<>
  {/* <PointerHandle disable={!(selected && isGrabbing)} 
    bounds={{
      minDX:-rOffset,
      minDY:-(trackInfo.idx * editorStats.trackHeight),
      maxDY:(trackInfo.max-1-trackInfo.idx)*editorStats.trackHeight,
    }} 
    onStart={onStartMoveChange} onChange={onChangeGrabHandler} onEnd={onEndGrabHandler}> */}
  <svg xmlns="http://www.w3.org/2000/svg"
    width={rDuration} 
    height={maxHeight} 
    style={styleRegion} 
    onClick={!selected ? selectHandler : null} 
    className={selected ? 'AudioRegion AudioRegionSelected' : 'AudioRegion'}>
    
    <defs>
      <clipPath id={`svgframe-${region.regionId}`}>
        <rect width={rww} height={maxHeight} rx="10" ry="10"/>
      </clipPath>
    </defs>

    <g clipPath={`url(#svgframe-${region.regionId})`}> 
      <polygon points={`0,0 0,${maxHeight} ${rFadeIn+rrFadeIn},0`} fill="white"></polygon>
      <polygon points={`${rww},0 ${rww},${maxHeight} ${rww-(rFadeOut+rrFadeOut)},0`} fill="yellow"></polygon>
      <rect className="AudioRegionFrame" width={rww} height={maxHeight} rx={10} ry={10}/>
    </g>
    
    { selected && isGrabbing ? <>
      <PointerHandle bounds={{
          minDX:-bOffset, 
          maxDX:bDuration-bOffset,
        }}  
        onStart={onStartResizeHandler} onChange={onChangeOffsetHandler} onEnd={onEndOffsetHandler}>
        <g className="DragHandle ">
          <circle r={maxHeight/4} cy={maxHeight/2}/>
        </g>
      </PointerHandle>
      <PointerHandle bounds={{
          minDX:-rDuration, 
          maxDX:(bDuration-bOffset)-rDuration,
        }} 
        onStart={onStartResizeHandler} onChange={onChangeDurationHandler} onEnd={onEndDurationHandler}>
        <g className="DragHandle "> 
          <circle r={maxHeight/4} cx={rww} cy={maxHeight/2}/>
        </g>
      </PointerHandle> 
      </>
      :
      null 
    }

    { selected && isFading ? <>
      <PointerHandle bounds={{
          minDX:-rFadeIn,
          maxDX:(rDuration-rFadeOut)-rFadeIn,
        }}
        onStart={()=>{console.log('fade start')}}
        onChange={onChangeFadeInHandler} onEnd={onEndFadeInHandler}>
        <g className="DragHandle " >
          <circle r={maxHeight/4} cx={rFadeIn+rrFadeIn} cy={-15}/>
        </g>
      </PointerHandle>
      {/* <PointerHandle bounds={{
          minDX:-(rDuration-rFadeOut)+rFadeIn,
          maxDX:rFadeOut,
        }} 
        onStart={()=>{console.log('fade out start')}}
        onChange={onChangeFadeOutHandler} onEnd={onEndFadeOutHandler}> */}
        <g className="DragHandle " onClick={(e)=>{e.preventDefault(); e.stopPropagation(); console.log('fadeoutclick')}} >
          <circle r={maxHeight/4} cx={rww - (rFadeOut+rrFadeOut)} cy={-5}/>
        </g>
      {/* </PointerHandle> */}
      </>
      :
      null 
    }

    {selected && isCutting ? <> 
      <PointerHandle bounds={{
        minDX:-cutPos,
        maxDX:rDuration-cutPos,
      }}        
      onChange={onChangeCutHandler} onEnd={onEndCutHandler}>
        <g className="DragHandle " >
          <circle r={maxHeight/4} cx={0} cy={maxHeight} transform={cutHandleTransform}/>
        </g>
      </PointerHandle> 
      <line stroke={'green'} x1={0} x2={0} y1={0} y2={maxHeight} transform={cutHandleLineTransform}/>
    </> : null}

  </svg>
  {/* </PointerHandle> */}

  {/* {pointerState === 'resize-change' ? <div style={{left: rOffset-bOffset, width: bDuration}} className='AudioRegion AudioRegionGhostBuffer'></div> : null}   
  {pointerState === 'move-change' ? <div style={{left: rOffset, width: rDuration}} className='AudioRegion AudioRegionGhostMove'></div> : null}    */}

  </>
  )
}

export default AudioRegion