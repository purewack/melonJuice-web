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
    setCutHandleTransform(`translateX(${rDuration/2}px)`)
    setCutHandleLineTransform(`translateX(${rDuration/2}px)`)
  }
  const onChangeCutHandler = ({dx, dy, prev_dy})=>{
    if(dy+15 < -editorStats.trackHeight) return

    const max = rDuration-cutPos;
    let dxx = snapCalc(rOffset + cutPos + dx) - rOffset//snapCalc(dx)-(rOffset - snapCalc(rOffset))
    if(dxx < 0) dxx = 0
    else if(dx === max) dxx = rDuration

    const cutBonudary = -20
    if(dy > cutBonudary) cutHandleDxx.current = dxx
    const thl = `translateX(${cutHandleDxx.current}px)`
    const th = thl + ` translateY(${dy <= cutBonudary ? dy : 0}px)`
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
    const thl = `translateX(${dxx}px)`
    const th = thl + ` translateY(0px)`
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
    height:'90%', 
    top:'5%',
    width: rDuration + rrDuration, 
    left: rOffset + rrOffset,
    transform: rrTransform,
  } 

  const styleHandle = {
    height:30,
    width:30,
    position:'absolute',
  }
  const styleDurationHandle = {
    ...styleHandle,
    right:-15,
  }
  const styleOffsetHandle = {
    ...styleHandle,
    right: undefined,
    left: -15,
  }
  const styleCutHandle = {
    ...styleHandle,
    right:undefined,
    bottom:-30,
    left:-15,
    transform:cutHandleTransform, 
  }
  const styleCutHandleLine = {
    height: editorStats.trackHeight,
    width:4,
    left:-2,
    bottom:-2,
    transform:cutHandleLineTransform,
  }
  const styleFadeInHandle = {
    ...styleHandle,
    left: -15,
    top:-30,
    transform: `translateX(${rFadeIn+rrFadeIn}px)`
  }
  const styleFadeOutHandle = {
    ...styleHandle,
    right: -15,
    top:-30,
    transform: `translateX(${-(rFadeOut+rrFadeOut)}px)`
  }
  
 
  return(<>
  <PointerHandle disable={!(selected && isGrabbing)} 
    bounds={{
      minDX:-rOffset,
      minDY:-(trackInfo.idx * editorStats.trackHeight),
      maxDY:(trackInfo.max-1-trackInfo.idx)*editorStats.trackHeight,
    }} 
    onStart={onStartMoveChange} onChange={onChangeGrabHandler} onEnd={onEndGrabHandler}>
  <div onClick={!selected ? selectHandler : null} style={styleRegion} className={selected ? 'AudioRegion AudioRegionSelected' : 'AudioRegion'}>
    
    { !(selected && isGrabbing) ?
    <div className='AudioRegionSVGContainer'>
      <svg className={'AudioRegionFadeSVG'} height={maxHeight}>
        <polygon points={`0,0 0,${maxHeight} ${rFadeIn+rrFadeIn},0`} fill="white"></polygon>
        <polygon points={`${rDuration},0 ${rDuration},${maxHeight} ${rDuration-(rFadeOut+rrFadeOut)},0`} fill="yellow"></polygon>
      </svg>
    </div>
    : null 
    }

    { selected && isGrabbing ? <>
      <PointerHandle bounds={{
          minDX:-bOffset, 
          maxDX:bDuration-bOffset,
        }}  
        onStart={onStartResizeHandler} onChange={onChangeOffsetHandler} onEnd={onEndOffsetHandler}>
        <div className="DragHandle AudioRegionOffsetHandle" style={styleOffsetHandle}></div>
      </PointerHandle>
      <PointerHandle bounds={{
          minDX:-rDuration, 
          maxDX:(bDuration-bOffset)-rDuration,
        }} 
        onStart={onStartResizeHandler} onChange={onChangeDurationHandler} onEnd={onEndDurationHandler}>
        <div className="DragHandle AudioRegionDurationHandle" style={styleDurationHandle}></div>
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
        onChange={onChangeFadeInHandler} onEnd={onEndFadeInHandler}>
        <div className="DragHandle AudioRegionFadeInHandle" style={styleFadeInHandle}></div>
      </PointerHandle>
      <PointerHandle bounds={{
          minDX:-(rDuration-rFadeOut)+rFadeIn,
          maxDX:rFadeOut,
        }} 
        onChange={onChangeFadeOutHandler} onEnd={onEndFadeOutHandler}>
        <div className="DragHandle AudioRegionFadeOutHandle" style={styleFadeOutHandle}></div>
      </PointerHandle>
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
        <div className="DragHandle AudioRegionCutHandle" style={styleCutHandle}></div>
      </PointerHandle> 
      <div className="AudioRegionCutHandleLine" style={styleCutHandleLine}></div>
    </> : null}

  </div>
  </PointerHandle>

  {pointerState === 'resize-change' ? <div style={{left: rOffset-bOffset, width: bDuration}} className='AudioRegion AudioRegionGhostBuffer'></div> : null}   
  {pointerState === 'move-change' ? <div style={{left: rOffset, width: rDuration}} className='AudioRegion AudioRegionGhostMove'></div> : null}   

  </>
  )
}

export default AudioRegion