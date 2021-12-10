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
  const rFadeOut = (editorStats.barLength*region.rFadeIn)
  const maxHeight = (editorStats.trackHeight)
  const selected = selectedRegion && selectedRegion.regionId === region.regionId
  const snap = {size: editorStats.barLength, grain: editorStats.snapGrain}

  const selectHandler = ()=>{
    if(selectedRegion && selectedRegion.id === region.id)
    onSelect(null)
    else
    onSelect(region)
  } 
  const [rrDuration, setRRDuration] = useState(0)
  const [rrOffset, setRROffset] = useState(0)
  const [rrTransform, setRRTransform] = useState(0)
  
  const onChangeDurationHandler = (stats)=>{
    setRRDuration(stats.dxx)
  }
  const onChangeOffsetHandler = ({dxx})=>{
    const rd = rOffset / editorStats.barLength
    setRROffset(dxx)
    setRRDuration(rd - dxx)
  }
  const onChangeGrabHandler = ({dxx})=>{
    setRRTransform(`translateX(${dxx}px)`)
  }

  const onEndDurationHandler = ({dxx})=>{
    if(dxx === 0) return
      const rd = (rDuration + dxx)/editorStats.barLength
      tracksDispatch({
       type:'update_region',
       updatedRegion: {...region, rDuration:rd},
       jumpRelativeTracks:0,
      })
  }
  const onEndOffsetHandler = ({dxx})=>{
    if(dxx === 0) return
      const ro = (rOffset + dxx)/editorStats.barLength
      const rd = (rDuration - dxx)/editorStats.barLength
      tracksDispatch({
       type:'update_region',
       updatedRegion: {...region, rOffset:ro, rDuration:rd},
       jumpRelativeTracks:0,
      })
  }
  const onEndGrabHandler = ({dxx})=>{
    if(dxx === 0) {
      selectHandler()
      return
    }
      const ro = (rOffset + dxx)/editorStats.barLength
      tracksDispatch({
       type:'update_region',
       updatedRegion: {...region, rOffset:ro},
       jumpRelativeTracks:0,
      })
  }

  useEffect(()=>{
    setRRDuration(0)
    setRROffset(0)
    setRRTransform('')
  },[region])
  
  const styleRegion = {
    height:'100%', 
    width: rDuration + rrDuration, 
    left: rOffset + rrOffset,
    transform: rrTransform,
  } 
  const styleDurationHandle = {
    height:30,
    width:30,
    borderRadius:'50%',
    background:'green',
    position:'absolute',
    right:-15,
  }
  const styleOffsetHandle = {
    ...styleDurationHandle,
    right: undefined,
    left: -15,
  }

  return(<>
  <PointerHandle snap={snap} onChange={onChangeGrabHandler} onEnd={onEndGrabHandler}>
  <div style={styleRegion} className={selected ? 'AudioRegion AudioRegionSelected' : 'AudioRegion'}>
      
    { 
      <PointerHandle snap={snap} onChange={onChangeOffsetHandler} onEnd={onEndOffsetHandler}>
        <div className="AudioRegionOffsetHandle" style={styleOffsetHandle}></div>
      </PointerHandle> 
    }
    
    {/* {rDuration ? 
      <svg style={{pointerEvents:"none"}} width={rDuration} height={maxHeight}>
        <line x1={0} x2={rDuration-1} y1={maxHeight/2} y2={maxHeight/2} stroke="white"></line>
        <polygon points={`0,0 0,${maxHeight} ${fadeIn},0`} fill="white"></polygon>
        <polygon points={`${rDuration},0 ${rDuration},${maxHeight} ${rDuration - (fadeOut)},0`} fill="white"></polygon>
      </svg>
    : null} */}

    { 
      <PointerHandle snap={snap} onChange={onChangeDurationHandler} onEnd={onEndDurationHandler}>
        <div className="AudioRegionDurationHandle" style={styleDurationHandle}></div>
      </PointerHandle> 
    }
      
    <p className='AudioRegionDebugTooltip'>{region.regionId}</p>
  </div>
  </PointerHandle>
  </>)
}

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