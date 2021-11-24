import '../css/AudioRegion.css';
import {useState,useEffect,useRef} from 'react'

const AudioRegion = ({region, prevRegion, nextRegion, trackInfo, tracksDispatch, editorStats})=>{

  const [rOffset, setrOffset] = useState()
  const [rDuration, setRDuration] = useState()
  const [rOffsetOld, setrOffsetOld] = useState()
  const [rDurationOld, setRDurationOld] = useState()
  const [rBOffset, setRBOffset] = useState()
  const [rBDuration, setRBDuration] = useState()
  const [fadeIn, setFadeIn] = useState(0)
  const [fadeOut, setFadeOut] = useState(0)
  const [handleHitbox, setHandleHitbox] = useState(null)
  const [maxHeight, setMaxHeight] = useState(0)
  const [dragVOffset, setDragVOffset] = useState(0)
  const [cutPos , setCutPos] = useState(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const regionStatsPrev = useRef()
  const resizeHandleArea = 10;
  const cutTarget = useRef()


  useEffect(()=>{
    setDragVOffset(0)
    setrOffset(editorStats.barLength*region.rOffset)
    setRDuration(editorStats.barLength*region.rDuration)
    setRBOffset(editorStats.barLength*region.bOffset)
    setRBDuration(editorStats.barLength*region.bDuration)
    setFadeIn(region.rFadeIn*editorStats.barLength)
    setFadeOut(region.rFadeOut*editorStats.barLength)
    // setFadeIn(100)
    // setFadeOut(30)
    setMaxHeight(editorStats.trackHeight)

    //temp resolve later
    setIsHovered(false)
  },[region,editorStats])

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

  const isNeighbourClear = (s,e)=>{
    const p = prevRegion ?  (prevRegion.rOffset+prevRegion.rDuration)*editorStats.barLength : null
    const n = nextRegion ?  nextRegion.rOffset*editorStats.barLength : null
    const offsetPrev = p ? s - p : null
    const offsetNext = n ? n - e : null
    return (offsetPrev >= 0 && offsetNext >= 0)
  }

  const cutCommit = (e)=>{
    const cutPosCommit = (cutPos/editorStats.barLength)
    tracksDispatch({type:'cut_region',regionToCut:region,regionCutLength:cutPosCommit})
  }
  const cutHover = (e)=>{
    if(cutTarget.current === null || cutTarget.current != e.target.getBoundingClientRect().left)
      cutTarget.current = e.target.getBoundingClientRect().left
    
    setCutPos(snapCalc(e.clientX) - cutTarget.current)
  }

  const duringAdjust = (type,pointer)=>{

    const r = regionStatsPrev.current
    regionStatsPrev.current.cursorDelta.x = pointer.x - regionStatsPrev.current.cursorInitial.x
    regionStatsPrev.current.cursorDelta.y = pointer.y - regionStatsPrev.current.cursorInitial.y
    const deltax = regionStatsPrev.current.cursorDelta.x
    const deltay = regionStatsPrev.current.cursorDelta.y
    // const delta = (type === 'touch' ? (pointer-regionStatsPrev.current.cursorInitial) : regionStatsPrev.current.cursorDelta ) 

    switch (r.target) {
      case 'EndHandle':{
          const d = snapCalc(r.right + deltax) - r.left
          const max = (rBDuration-rBOffset)
          if(d <= max && isNeighbourClear(r.left,d+r.left)){
            setRDuration(d)
            regionStatsPrev.current.rDuration = d
          }
        }
        break;
      
      case 'StartHandle':{
          const d = snapCalc(r.left + deltax)
          const o = r.rrbo+(d-r.left)

          if( d >= 0 && o >= 0 && d < r.right-resizeHandleArea && isNeighbourClear(d,r.right)){
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

        const voff = snapVCalc(deltay)
        const tidx = (dragVOffset+voff) / editorStats.trackHeight
        
        if(tidx + trackInfo.idx >= 0 &&  tidx + trackInfo.idx <= trackInfo.max-1)
        setDragVOffset(voff)
        regionStatsPrev.current.dragVOffset = voff
      break;
    }
  }

  const mouseup = (e)=>{e.preventDefault();  endAdjust('mouse')}
  const mousemove = (e)=>{e.preventDefault(); duringAdjust('mouse',{x:e.clientX, y:e.clientY})}
  const touchmove = (e)=>{e.preventDefault();  duringAdjust('touch',{x:e.touches[0].clientX, y:e.touches[0].clientY})}
  const touchup = (e)=>{endAdjust('touch')}
  
  const startAdjust = (type,target,cursorInitial)=>{  
    regionStatsPrev.current = {
      target, 
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
    setHandleHitbox(target)

    if(type === 'mouse'){
      window.addEventListener('mouseup',mouseup)
      window.addEventListener('mousemove',mousemove)
    }
    else{
      document.addEventListener('touchmove', touchmove, { passive: false });
      document.addEventListener('touchend', touchup, { passive: false });
    }
  }

  const endAdjust = (type)=>{
    if(type === 'mouse'){
      window.removeEventListener('mouseup',mouseup)
      window.removeEventListener('mousemove',mousemove)
    }
    else{
      document.removeEventListener('touchmove', touchmove, { passive: false })
      document.removeEventListener('touchend', touchup, { passive: false });
    }
    setHandleHitbox(null)
    if(regionStatsPrev.current.cursorDelta === 0) {
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

  return(<>
  <div
    style={{height:'100%', width: rDuration, left: rOffset, top:dragVOffset}}
    className={
      editorStats.toolMode === 'cut' ? 'AudioRegion AudioRegionCut' : 
      (handleHitbox || isHovered ? 'AudioRegion AudioRegionDrag' : 'AudioRegion')
    } 
    onMouseDown={editorStats.toolMode === 'grab' ? (e)=>{startAdjust('mouse', e.target.className, {x:e.clientX,y:e.clientY})} : cutCommit}
    onMouseMove={editorStats.toolMode === 'cut' ? cutHover : null}
    onMouseEnter={editorStats.toolMode === 'cut' ? (e)=>{setCutPos(null)} : (e)=>{setIsHovering(true)}}
    onMouseLeave={editorStats.toolMode === 'cut' ? (e)=>{setCutPos(null)}  : (e)=>{setIsHovering(false)}}
    // onTouchStart={(e=>{startAdjust( 'touch',e.target.className,{ x:e.touches[0].clientX, y:touches[0].clientY } )})}
    >
    {rDuration ? 
      <svg style={{pointerEvents:"none"}} width={rDuration} height={maxHeight}>
        <line x1={0} x2={rDuration-1} y1={maxHeight/2} y2={maxHeight/2} stroke="white"></line>
        <polygon points={`0,0 0,${maxHeight} ${fadeIn},0`} fill="white"></polygon>
        <polygon points={`${rDuration},0 ${rDuration},${maxHeight} ${rDuration - (fadeOut)},0`} fill="white"></polygon>
      </svg>
    : null}
    
    {editorStats.toolMode === 'grab' && isHovering && <span className='StartHandle' style={{width:resizeHandleArea}}>|</span>}
      {/* <span style={{pointerEvents:'none'}}> 
        {`${prevRegion && prevRegion.regionId.slice(-2)} < ${region.regionId.slice(-2)} > ${nextRegion && nextRegion.regionId.slice(-2)}`} 
      </span> */}
    {editorStats.toolMode === 'grab' && isHovering && <span className='EndHandle' style={{width:resizeHandleArea}}>|</span> }  
    
    <p className='AudioRegionDebugTooltip'>{region.regionId}</p>
  </div>

  {
    (editorStats.toolMode === 'cut' && cutPos) ? <div style={{left:rOffset+cutPos}} className='AudioRegionCutIndicator'></div> :
    
    (handleHitbox === 'StartHandle' || handleHitbox === 'EndHandle') 
    ? <div style={{left: rOffsetOld-regionStatsPrev.current.rrbo, width: rBDuration}} className='AudioRegion AudioRegionGhostBuffer'></div> 
    : handleHitbox ? <div style={{width: rDurationOld, left: rOffsetOld}} className='AudioRegion AudioRegionGhostMove'></div> : null
     
  }
  </>)
}

export default AudioRegion