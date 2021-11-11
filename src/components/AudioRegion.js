import './components.css';
import {useState,useEffect,useRef} from 'react'

const AudioRegion = ({region, tracksDispatch, editorStats})=>{

  const [rOffset, setrOffset] = useState()
  const [rDuration, setRDuration] = useState()
  const [rOffsetOld, setrOffsetOld] = useState()
  const [rDurationOld, setRDurationOld] = useState()
  const [rBOffset, setRBOffset] = useState()
  const [rBDuration, setRBDuration] = useState()
  const [handleHitbox, setHandleHitbox] = useState(null)
  const [cutPos , setCutPos] = useState(null)
  const regionStatsPrev = useRef()
  const resizeArea = 10;

  useEffect(()=>{
    setrOffset(editorStats.barLength*region.rOffset)
    setRDuration(editorStats.barLength*region.rDuration)
    setRBOffset(editorStats.barLength*region.bOffset)
    setRBDuration(editorStats.barLength*region.bDuration)
  },[region,editorStats])

  const snapCalc = (ll)=>{
    if(editorStats.snapGrain){
      let b = (editorStats.barLength/editorStats.snapGrain)
      let l = Math.floor(ll/b)*b
      return l;
    }
    return ll
  }

  const cutCommit = (e)=>{
    const cutPosCommit = (cutPos/editorStats.barLength)
    console.log(cutPosCommit)
    console.log(region)
    tracksDispatch({type:'cut_region',regionToCut:region,regionCutLength:cutPosCommit})
  }
  const cutHover = (e)=>{
    setCutPos(snapCalc(e.pageX - e.target.getBoundingClientRect().left))
  }

  const duringAdjust = (type,pointer)=>{

    const r = regionStatsPrev.current
    regionStatsPrev.current.cursorDelta += pointer
    const delta = (type === 'touch' ? (pointer-regionStatsPrev.current.cursorInitial) : regionStatsPrev.current.cursorDelta ) 

    switch (r.target) {
      case 'EndHandle':{
          const d = snapCalc(r.right + delta) - r.left
          const max = (rBDuration-rBOffset)
          if(d <= max){
            setRDuration(d)
            regionStatsPrev.current.rDuration = d
          }
        }
        break;
      
      case 'StartHandle':{
          const d = snapCalc(r.left + delta)
          const o = r.rrbo+(d-r.left)

          if( o >= 0 ){
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
        let o = snapCalc(r.left + delta)
        if(o >= 0) {
          setrOffset(o)
          regionStatsPrev.current.rOffset = o
        }
        break;
    }
  }

  const mouseup = (e)=>{e.preventDefault();  endAdjust('mouse')}
  const mousemove = (e)=>{e.preventDefault();  duringAdjust('mouse',e.movementX)}
  const touchmove = (e)=>{e.preventDefault();  duringAdjust('touch',e.touches[0].pageX)}
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
      cursorDelta:0,
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
    if(regionStatsPrev.current.mouseDelta === 0) return

    const s = regionStatsPrev.current.rOffset/editorStats.barLength;
    const d = regionStatsPrev.current.rDuration/editorStats.barLength;
    const o = regionStatsPrev.current.rBOffset/editorStats.barLength;

    const newRegion = {...region, rOffset:s, rDuration:d, bOffset:o}
    tracksDispatch({type:'update_region', updatedRegion:newRegion})
  }  

  // const cancelEdit = (e)=>{
  //   mouseUp(null)
  //   setrOffset(rOffsetOld)
  //   setRDuration(rDurationOld)
  //   console.log('cancel')
  // }

  return(<>
  <div
    style={{width: rDuration, left: rOffset}}
    className={
      editorStats.toolMode === 'cut' ? 'AudioRegion AudioRegionCut' : 
      (handleHitbox ? 'AudioRegion AudioRegionDrag' : 'AudioRegion')
    } 
    onMouseDown={editorStats.toolMode === 'grab' ? (e)=>{startAdjust('mouse',e.target.className,0)} : cutCommit}
    onMouseMove={editorStats.toolMode === 'cut' ? cutHover : null}
    onMouseEnter={editorStats.toolMode === 'cut' ? (e)=>{setCutPos(null)} : null}
    onMouseLeave={editorStats.toolMode === 'cut' ? (e)=>{setCutPos(null)}  : null}
    // onTouchStart={(e=>{startAdjust('touch',e.target.className,e.touches[0].pageX)})}
    >
    {editorStats.toolMode === 'grab' && <span className='StartHandle' style={{width:resizeArea}}>|</span>}
      <span style={{pointerEvents:'none'}}> 
        {/* {`${region.rPrevId && region.rPrevId.slice(-2)} < ${region.regionId.slice(-2)} > ${region.rNextId && region.rNextId.slice(-2)}`}  */}
      </span>
    {editorStats.toolMode === 'grab' && <span className='EndHandle' style={{width:resizeArea}}>|</span> }  
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