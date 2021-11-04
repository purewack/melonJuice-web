import './components.css';
import {useState,useEffect,useRef} from 'react'

const AudioRegion = ({region, setRegion, bar, shouldSnap, mousePos})=>{
  const [bStart, setBStart] = useState()
  const [bDuration, setBDuration] = useState()
  const [bOffset, setBOffset] = useState()
  const [handleHitbox, setHandleHitbox] = useState(null)
  const preClick = useRef()
  const resizeArea = 10;

  const snapCalc = (ll)=>{
    if(shouldSnap){
      let b = (bar/shouldSnap)
      let l = Math.floor(ll/b)*b
      return l;
    }
    return ll
  }

  useEffect(()=>{
    setBStart(bar*region.rStart)
    setBDuration(bar*region.rDuration)
    setBOffset(bar*region.rBufferOffset)
  },[region,bar])

  useEffect(()=>{
    if(mousePos === null) setHandleHitbox(null)
    if(!handleHitbox || !mousePos) return

    let pe = preClick.current
    let delta = snapCalc(mousePos - pe.cx)
    let ne = snapCalc(mousePos - 50)
    
    switch (handleHitbox) {
      case 'EndHandle':
        setBDuration(ne - pe.left)
        break;
      
      case 'StartHandle':
        let o = (pe.o+ne)-pe.left
        if(o >= 0){
          setBOffset(o)
          setBStart(ne)
          setBDuration(pe.right-ne)
        }
        break;

      default:
        setBStart(snapCalc(pe.left) + delta)
        break;
    }
  },[mousePos])

  const mouseDown = (e)=>{
    e.preventDefault()
    preClick.current = {cx:e.pageX, left: bStart, width: bDuration, right:bStart+bDuration, o:bOffset}
    setHandleHitbox(e.target.className)
  }
  const mouseUp = (e)=>{
    if(!e) return
    e.preventDefault()
    setHandleHitbox(null)

    if(e.pageX === preClick.current.cx) return
    const s = bStart/bar;
    const d = bDuration/bar;
    const o = bOffset/bar;

    const newRegion = {...region, rStart:s, rDuration:d, rBufferOffset:o}
    // console.log({s,d,o})
    // console.log(region)
    // console.log(newRegion)
    setRegion(newRegion)
  }

  const pointerEvents = {width:resizeArea}

  return(<div
    className={handleHitbox ? 'AudioRegion AudioRegionDrag' : 'AudioRegion'} 
    style={{width: bDuration, left: bStart}}
    onMouseDown={mouseDown}
    onMouseUp={mouseUp}
    >
    <span className='StartHandle' style={pointerEvents}>|</span>
    <span> </span>
    <span className='EndHandle' style={pointerEvents}>|</span>  
  </div>)
}

export default AudioRegion