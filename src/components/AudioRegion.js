import '../css/AudioRegion.css';
import {useState,useEffect,useRef,useCallback} from 'react'
import PointerHandle  from '../interfaces/PointerHandle';
//import{useRenders} from '../Util'

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
  const snapCalc = (ll)=>{
    if(editorStats.snapGrain){
      let b = (editorStats.barLength/editorStats.snapGrain)
      let l = Math.floor(ll/b)*b
     return l;
    }
    return ll
  }
  const selectHandler = ()=>{
    if(selectedRegion)
    onSelect(null)
    else
    onSelect(region)
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
    const dxx = snapCalc(dx)-(rDuration - snapCalc(rDuration))
    setRRDuration(dxx)
  }
  const onEndDurationHandler = ({dx})=>{
    setPointerState('')
    if(dx === 0) return
      const dxx = snapCalc(dx)-(rDuration - snapCalc(rDuration))
      const rd = (rDuration + dxx)/editorStats.barLength
      tracksDispatch({
       type:'update_region',
       updatedRegion: {...region, rDuration:rd},
       jumpRelativeTracks:0,
      })
  }

  const onChangeOffsetHandler = ({dx})=>{
    const dxx = snapCalc(dx)-(rOffset - snapCalc(rOffset))
    setRROffset(dxx)
    setRRDuration(-dxx)
  }
  const onEndOffsetHandler = ({dx})=>{
    setPointerState('')
    if(dx === 0) return
      const dxx = snapCalc(dx)-(rOffset - snapCalc(rOffset))
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

  const onChangeCutHandler = ({dx, dy, prev_dy})=>{
    if(dy+15 < -editorStats.trackHeight) return

    const dxx = snapCalc(dx)-(rOffset - snapCalc(rOffset))
    const cutBonudary = -20
    if(dy > cutBonudary) cutHandleDxx.current = dxx
    const thl = `translateX(${cutPos + cutHandleDxx.current}px)`
    const th = thl + ` translateY(${dy <= cutBonudary ? dy : 0}px)`
    setCutHandleTransform(th)
    setCutHandleLineTransform(thl)

    if(editorStats.trackHeight+dy <= 0 && editorStats.trackHeight+prev_dy > 0) {
      const cp = cutPos + dxx
      const cutPosCommit = (cp/editorStats.barLength)
      onSelect(null)
      tracksDispatch({type:'cut_region',regionToCut:region,regionCutLength:cutPosCommit})
    }
  }
  const onEndCutHandler = ({dx,dy}) => {
    setCutPos(cutPos + dx)
    const thl = `translateX(${cutPos + cutHandleDxx.current}px)`
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
    setCutPos(0)
    setPointerState('')
  },[region])
  
  const styleRegion = {
    height:'100%', 
    width: rDuration + rrDuration, 
    left: rOffset + rrOffset,
    transform: rrTransform,
  } 

  const styleHandle = {
    height:30,
    width:30,
    borderRadius:'50%',
    background:'green',
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
    height: editorStats.trackHeight-2,
    width:2,
    left:0,
    bottom:0,
    transform:cutHandleLineTransform,
  }
  const styleFadeInHandle = {
    ...styleHandle,
    left: -15,
    top:0,
    transform: `translateX(${rFadeIn+rrFadeIn}px)`
  }
  const styleFadeOutHandle = {
    ...styleHandle,
    right: -15,
    bottom:0,
    transform: `translateX(${-(rFadeOut+rrFadeOut)}px)`
  }
  
 
  return(<>
  <PointerHandle disable={!(selected && isGrabbing)} 
    bounds={{
      minDX:-snapCalc(rOffset),
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
    {/*      
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
    */}
    { selected && isGrabbing ? <>
      <PointerHandle bounds={{
          minDX:-bOffset, 
          maxDX:bDuration-bOffset,
        }}  
        onStart={onStartResizeHandler} onChange={onChangeOffsetHandler} onEnd={onEndOffsetHandler}>
        <div className="AudioRegionOffsetHandle" style={styleOffsetHandle}></div>
      </PointerHandle>
      <PointerHandle bounds={{
          minDX:-rDuration, 
          maxDX:(bDuration-bOffset)-rDuration,
        }} 
        onStart={onStartResizeHandler} onChange={onChangeDurationHandler} onEnd={onEndDurationHandler}>
        <div className="AudioRegionDurationHandle" style={styleDurationHandle}></div>
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
        <div className="AudioRegionFadeInHandle" style={styleFadeInHandle}></div>
      </PointerHandle>
      <PointerHandle bounds={{
          minDX:-(rDuration-rFadeOut)+rFadeIn,
          maxDX:rFadeOut,
        }} 
        onChange={onChangeFadeOutHandler} onEnd={onEndFadeOutHandler}>
        <div className="AudioRegionFadeOutHandle" style={styleFadeOutHandle}></div>
      </PointerHandle>
      </>
      :
      null 
    }
    {selected && isCutting ? <> 
      <PointerHandle bounds={{
        minDX:-cutPos,
        maxDX:rDuration-cutPos-2,
      }}        
      onChange={onChangeCutHandler} onEnd={onEndCutHandler}>
        <div className="AudioRegionCutHandle" style={styleCutHandle}></div>
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
//  :  ? <div style={{width: rDurationOld, left: rOffsetOld}} className='AudioRegion AudioRegionGhostMove'></div> : null
export default AudioRegion


 /*
  
  const snapVCalc = (ll)=>{
    let b = (maxHeight)
    let l = Math.floor(ll/b)*b
    return l;
  }

  const snapCalc = (ll)=>{
    if(editorStats.snapGrain){
      let b = (editorStats.barLength/editorStats.snapGrain)
      let l = Math.floor(ll/b)*b
     return l;
    }
    return ll
  }
  const cutStart = ()=>{
    setCutPos(null); 
    regionStatsPrev.current = {boundBox:null, cp:null}
  }
  const cutCommit = (e)=>{
    const cp = cutPos
    console.log(cp)
    if(!cp) return
    const cutPosCommit = (cp/editorStats.barLength)
    tracksDispatch({type:'cut_region',regionToCut:region,regionCutLength:cutPosCommit})
  }
  const cutHover = (mode,e)=>{
    if(regionStatsPrev.current.boundBox === null || regionStatsPrev.current.boundBox !== e.target.getBoundingClientRect())
      regionStatsPrev.current.boundBox = e.target.getBoundingClientRect()
    
    console.log(mode)
    const tp = (mode === 'mouse' ? e.clientX : e.touches[0].clientX)
    const cp = snapCalc(tp) - regionStatsPrev.current.boundBox.left 
    setCutPos(newcp => cp)
    //regionStatsPrev.current.cp = cp
  }

  const duringAdjust = (type,pointer)=>{

    const r = regionStatsPrev.current
    regionStatsPrev.current.cursorDelta.x = pointer.x - regionStatsPrev.current.cursorInitial.x
    regionStatsPrev.current.cursorDelta.y = pointer.y - regionStatsPrev.current.cursorInitial.y
    const deltax = regionStatsPrev.current.cursorDelta.x
    const deltay = regionStatsPrev.current.cursorDelta.y
    if(regionStatsPrev.current.boundBox === null || regionStatsPrev.current.boundBox !== r.target.getBoundingClientRect())
      regionStatsPrev.current.boundBox = r.target.getBoundingClientRect()
    

    switch (r.target.className) {
      case 'EndHandle':{
          const d = snapCalc(r.right + deltax) - r.left
          const max = (rBDuration-rBOffset)
          if(d <= max){
            setRDuration(d)
            regionStatsPrev.current.rDuration = d
          }
        }
        break;
      
      case 'StartHandle':{
          const d = snapCalc(r.left + deltax)
          const o = r.rrbo+(d-r.left)

          if( d >= 0 && o >= 0 && d < r.right-resizeHandleArea ){
            regionStatsPrev.current.rbo = o
            setRBOffset(o)
            setrOffset(d)
            setRDuration(r.right-d)
            regionStatsPrev.current.rBOffset = o
            regionStatsPrev.current.rOffset = d
            regionStatsPrev.current.rDuration = r.right-d
          }
        }
        break;

      default:
        const o = snapCalc(r.left + deltax)
        // if(o >= 0 && isNeighbourClear(o,o+rDuration)) {
        if(o >= 0) {
          setrOffset(o)
          regionStatsPrev.current.rOffset = o
        }

        const bh = regionStatsPrev.current.boundBox.height/2;
        const voff = snapVCalc(deltay+bh);
        const tidx = (dragVOffset+voff) / editorStats.trackHeight
        
        if(tidx + trackInfo.idx >= 0 &&  tidx + trackInfo.idx <= trackInfo.max-1)
        setDragVOffset(voff)
        regionStatsPrev.current.dragVOffset = voff
      break;
    }
  }

  const mousedown = (e)=>{
    e.preventDefault(); 
    if(isSelected){
    startAdjust('mouse', e.target, {x:e.clientX,y:e.clientY})  
    }
  } 
  const mouseup = (e)=>{
    e.preventDefault(); 
    if(!isSelected) onSelect(region)
    else{
      endAdjust('mouse')
    }
  }
  const mousemove = useCallback(
    (e)=>{
      e.preventDefault();
      console.log(`reg ${isSelected}`)  
      if(isSelected)
      duringAdjust('mouse',{x:e.clientX, y:e.clientY})
    },
    [isSelected],
  )


  const touchmove = (e)=>{
    e.preventDefault();  
    duringAdjust('touch',{x:e.touches[0].clientX, y:e.touches[0].clientY})
  }
  const touchup = (e)=>{
    endAdjust('touch')
  }
  const touchdown = editorStats.toolMode === 'grab'
    ? (e=>{startAdjust('touch',e.target,{ x:e.touches[0].clientX, y:e.touches[0].clientY } )}) 
    : (e=>{ 
      cutStart()
      document.addEventListener('touchmove', (e)=>{e.preventDefault(); cutHover('touch',e)}, { passive: false });
      document.addEventListener('touchend', (e)=>{e.preventDefault(); cutCommit()}, { passive: false });
    })

  const startAdjust = (type,target,cursorInitial)=>{  
    regionStatsPrev.current = {
      target, 
      boundBox:null,
      left: rOffset,
      width: rDuration, 
      right:rOffset+rDuration, 
      rbo:rBOffset,
      rbd:rBDuration,
      rrbo:rBOffset,
      rOffset:rOffset,
      rDuration:rDuration,
      rBOffset:rBOffset,
      dragVOffset:0,
      cursorDelta:{x:0,y:0},
      cursorInitial,
    }
    
    setrOffsetOld(rOffset)
    setRDurationOld(rDuration)
    setHandleHitbox(target.className)

    //  document.addEventListener('touchmove', touchmove, { passive: false });
    //  document.addEventListener('touchend', touchup, { passive: false });
  }

  const endAdjust = (type)=>{
    //  document.removeEventListener('touchmove', touchmove, { passive: false })
    //  document.removeEventListener('touchend', touchup, { passive: false });
    setHandleHitbox(null)
    if(regionStatsPrev.current.cursorDelta.x === 0 && regionStatsPrev.current.cursorDelta.y === 0) {
      tracksDispatch({type:'select_region', region})
      return
    }

    const s = regionStatsPrev.current.rOffset/editorStats.barLength;
    const d = regionStatsPrev.current.rDuration/editorStats.barLength;
    const o = regionStatsPrev.current.rBOffset/editorStats.barLength;
    const newRegion = {...region, rOffset:s, rDuration:d, bOffset:o}
    let newTrack = null
    if(regionStatsPrev.current.dragVOffset) newTrack = Math.floor(regionStatsPrev.current.dragVOffset / editorStats.trackHeight)
    tracksDispatch({type:'update_region', updatedRegion:newRegion, jumpRelativeTracks:newTrack})
  }  

  // const cancelEdit = (e)=>{
  //   mouseUp(null)
  //   setrOffset(rOffsetOld)
  //   setRDuration(rDurationOld)
  //   console.log('cancel')
  // }
  */