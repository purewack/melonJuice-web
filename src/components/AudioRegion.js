import '../css/AudioRegion.css';
import {useState,useEffect,useRef,useCallback} from 'react'
import { PointerHandle } from '../interfaces/PointerHandle';
//import{useRenders} from '../Util'

const AudioRegion = ({region, selectedRegion, onSelect, trackInfo, tracksDispatch, editorStats})=>{

  const [rOffset, setROffset] = useState()
  const [rDuration, setRDuration] = useState()
  const [rBOffset, setRBOffset] = useState()
  const [rBDuration, setRBDuration] = useState()
  const [fadeIn, setFadeIn] = useState(0)
  const [fadeOut, setFadeOut] = useState(0)
  const [maxHeight, setMaxHeight] = useState(0)
  const [cutPos , setCutPos] = useState(null)
  const [isSelected, setIsSelected] = useState(false)

  useEffect(()=>{
    setROffset(editorStats.barLength*region.rOffset)
    setRDuration(editorStats.barLength*region.rDuration)
    setRBOffset(editorStats.barLength*region.bOffset)
    setRBDuration(editorStats.barLength*region.bDuration)
    setFadeIn(editorStats.barLength*region.rFadeIn)
    setFadeOut(editorStats.barLength*region.rFadeIn)
    // setFadeIn(100)
    // setFadeOut(30)
    setMaxHeight(editorStats.trackHeight)

    //temp resolve later
    const selected = selectedRegion && selectedRegion.regionId === region.regionId
    setIsSelected(selected)
  },[region,selectedRegion,editorStats])

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
 /* const cutStart = ()=>{
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

  return(<>
  <div
    style={{height:'100%', width: rDuration, left: rOffset, top:dragVOffset}}
    className={
      editorStats.toolMode === 'cut' ? 'AudioRegion AudioRegionCut' : 
      ( isSelected ? 'AudioRegion AudioRegionSelected' : 'AudioRegion')
    }  

    >
    {rDuration ? 
      <svg style={{pointerEvents:"none"}} width={rDuration} height={maxHeight}>
        <line x1={0} x2={rDuration-1} y1={maxHeight/2} y2={maxHeight/2} stroke="white"></line>
        <polygon points={`0,0 0,${maxHeight} ${fadeIn},0`} fill="white"></polygon>
        <polygon points={`${rDuration},0 ${rDuration},${maxHeight} ${rDuration - (fadeOut)},0`} fill="white"></polygon>
      </svg>
    : null}

    { 
      <PointerHandle >
        <div></div>
      </PointerHandle> 
    }
      
    <p className='AudioRegionDebugTooltip'>{region.regionId}</p>
  </div>

  </>)
}

export default AudioRegion