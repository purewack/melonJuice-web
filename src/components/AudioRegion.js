import './components.css';
import {useState,useEffect,useRef} from 'react'

const AudioRegion = ({region, tracksDispatch, barLength, snapGrain})=>{

  const [rStart, setRStart] = useState()
  const [rDuration, setRDuration] = useState()
  const [rStartOld, setRStartOld] = useState()
  const [rDurationOld, setRDurationOld] = useState()
  const [rBOffset, setRBOffset] = useState()
  const [rBDuration, setRBDuration] = useState()
  const [handleHitbox, setHandleHitbox] = useState(null)
  const regionStatsPrev = useRef()
  const resizeArea = 10;

  useEffect(()=>{
    setRStart(barLength*region.rStart)
    setRDuration(barLength*region.rDuration)
    setRBOffset(barLength*region.rBufferOffset)
    setRBDuration(barLength*region.rBufferDuration)
  },[region,barLength])

  const mouseMove = (e)=>{
    e.preventDefault()
    const snapCalc = (ll)=>{
      if(snapGrain){
        let b = (barLength/snapGrain)
        let l = Math.floor(ll/b)*b
        return l;
      }
      return ll
    }

    const r = regionStatsPrev.current
    regionStatsPrev.current.mouseDelta += e.movementX
    const delta = regionStatsPrev.current.mouseDelta 

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
            setRStart(d)
            setRDuration(r.right-d)
            regionStatsPrev.current.rBOffset = o
            regionStatsPrev.current.rStart = d
            regionStatsPrev.current.rDuration = r.right-d
          }
        }
        break;

      default:
        let o = snapCalc(r.left + delta)
        if(o > 0) {
          setRStart(o)
          regionStatsPrev.current.rStart = o
        }
        break;
    }
  }

  const mouseDown = (e)=>{   
    e.preventDefault()
    const target = e.target.className
    regionStatsPrev.current = {
      target, 
      left: rStart,
      width: rDuration, 
      right:rStart+rDuration, 
      rbo:rBOffset,
      rbd:rBDuration,
      rrbo:rBOffset,
      mouseDelta:0,
      rStart:rStart,
      rDuration:rDuration,
      rBOffset:rBOffset,
    }
    
    setRStartOld(rStart)
    setRDurationOld(rDuration)
    setHandleHitbox(target)

    window.addEventListener('mouseup',mouseUp)
    window.addEventListener('mousemove',mouseMove)
  }

  const mouseUp = (e)=>{
    window.removeEventListener('mouseup',mouseUp)
    window.removeEventListener('mousemove',mouseMove)
    setHandleHitbox(null)
    if(regionStatsPrev.current.mouseDelta === 0) return

    const s = regionStatsPrev.current.rStart/barLength;
    const d = regionStatsPrev.current.rDuration/barLength;
    const o = regionStatsPrev.current.rBOffset/barLength;

    const newRegion = {...region, rStart:s, rDuration:d, rBufferOffset:o}
    tracksDispatch({type:'update_region', updatedRegion:newRegion})
  }  

  // const cancelEdit = (e)=>{
  //   mouseUp(null)
  //   setRStart(rStartOld)
  //   setRDuration(rDurationOld)
  //   console.log('cancel')
  // }

  return(<>
  {
    (handleHitbox === 'StartHandle' || handleHitbox === 'EndHandle') 
    ? <div style={{left: rStartOld-regionStatsPrev.current.rrbo, width: rBDuration}} className='AudioRegion AudioRegionGhostBuffer'></div> 
    : (
      handleHitbox ? <div style={{width: rDurationOld, left: rStartOld}} className='AudioRegion AudioRegionGhostMove'></div> : null
    )
  }
  <div
    className={handleHitbox ? 'AudioRegion AudioRegionDrag' : 'AudioRegion'} 
    style={{width: rDuration, left: rStart}}
    onMouseDown={mouseDown}
    >
    <span className='StartHandle' style={{width:resizeArea}}>|</span>
      <span style={{pointerEvents:'none'}}> 
        {/* {`${region.rPrevId && region.rPrevId.slice(-2)} < ${region.regionId.slice(-2)} > ${region.rNextId && region.rNextId.slice(-2)}`}  */}
      </span>
    <span className='EndHandle' style={{width:resizeArea}}>|</span>  
  </div>
  </>)
}

export default AudioRegion