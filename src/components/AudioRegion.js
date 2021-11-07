import './components.css';
import {useState,useEffect,useRef} from 'react'

const AudioRegion = ({region, setRegion, onRegionSelect, mouseEvents, editorSettings})=>{
  const [rStart, setRStart] = useState()
  const [rDuration, setRDuration] = useState()
  const [rBOffset, setRBOffset] = useState()
  const [rBDuration, setRBDuration] = useState()
  const [handleHitbox, setHandleHitbox] = useState(null)
  const regionStatsPrev = useRef()
  const resizeArea = 10;

  useEffect(()=>{
    setRStart(editorSettings.barLength*region.rStart)
    setRDuration(editorSettings.barLength*region.rDuration)
    setRBOffset(editorSettings.barLength*region.rBufferOffset)
    setRBDuration(editorSettings.barLength*region.rBufferDuration)
  },[region,editorSettings.barLength])

  useEffect(()=>{
    if(mouseEvents){
      switch(mouseEvents.type){
        case 'move':
          mouseMove(mouseEvents.x, mouseEvents.xOld)
          break;
        case 'up':
          mouseUp(mouseEvents.x, mouseEvents.xOld)
          break;
        default:
          break;
      }
    }
  },[mouseEvents])

  const mouseDown = (e, x)=>{   
    regionStatsPrev.current = {left: rStart, width: rDuration, right:rStart+rDuration, o:rBOffset}
    onRegionSelect(region)
    setHandleHitbox(e.target.className)
  }
  const mouseMove = (x, xOld)=>{

    const snapCalc = (ll)=>{
      if(editorSettings.snapGrain){
        let b = (editorSettings.barLength/editorSettings.snapGrain)
        let l = Math.floor(ll/b)*b
        return l;
      }
      return ll
    }

    let r = regionStatsPrev.current
    let delta = snapCalc(x - xOld)
    let ne = snapCalc(x)
    
    switch (handleHitbox) {
      case 'EndHandle':
        let d = (ne - r.left)
        if(d <= rBDuration){
          setRDuration(d)
        }
        break;
      
      case 'StartHandle':
        let o = (r.o+ne)-r.left
        if(o >= 0){
          setRBOffset(o)
          setRStart(ne)
          setRDuration(r.right-ne)
        }
        break;

      default:
        setRStart(snapCalc(r.left) + delta)
        break;
    }
  }
  const mouseUp = (x, xOld)=>{
    setHandleHitbox(null)
    if(x === xOld) return
    // const s = rStart/editorSettings.barLength;
    // const d = rDuration/editorSettings.barLength;
    // const o = rBOffset/editorSettings.barLength;

    // const newRegion = {...region, rStart:s, rDuration:d, rBufferOffset:o}
    // // console.log({s,d,o})
    // // console.log(region)
    // // console.log(newRegion)
    // setRegion(newRegion)
  }

  const pointerEvents = {width:resizeArea}

  return(<div
    className={handleHitbox ? 'AudioRegion AudioRegionDrag' : 'AudioRegion'} 
    style={{width: rDuration, left: rStart}}
    onMouseDown={mouseDown}
    >
    <span className='StartHandle' style={pointerEvents}>|</span>
    <span style={{pointerEvents:'none'}}> {`${region.rPrev && region.rPrev.regionId.slice(-2)} < ${region.regionId.slice(-2)} > ${region.rNext && region.rNext.regionId.slice(-2)}`} </span>
    <span className='EndHandle' style={pointerEvents}>|</span>  
  </div>)
}

export default AudioRegion