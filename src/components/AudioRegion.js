import './components.css';
import {useState,useEffect,useRef} from 'react'

const AudioRegion = ({region, setRegion, bar, shouldSnap, mousePos, mouseOffset})=>{
  const [rStart, setRStart] = useState()
  const [rDuration, setRDuration] = useState()
  const [rBOffset, setRBOffset] = useState()
  const [rBDuration, setRBDuration] = useState()
  const [handleHitbox, setHandleHitbox] = useState(null)
  const preClick = useRef()
  const resizeArea = 10;
  const [relationLabel, setRelationLabel] = useState(' < > ')


  useEffect(()=>{
    setRStart(bar*region.rStart)
    setRDuration(bar*region.rDuration)
    setRBOffset(bar*region.rBufferOffset)
    setRBDuration(bar*region.rBufferDuration)
  },[region,bar])

  useEffect(()=>{
    const snapCalc = (ll)=>{
      if(shouldSnap){
        let b = (bar/shouldSnap)
        let l = Math.floor(ll/b)*b
        return l;
      }
      return ll
    }

    if(mousePos === null) setHandleHitbox(null)
    if(!handleHitbox || !mousePos) return

    let pe = preClick.current
    let delta = snapCalc(mousePos - pe.cx)
    let ne = snapCalc(mousePos - mouseOffset)
    
    switch (handleHitbox) {
      case 'EndHandle':
        let d = (ne - pe.left)
        if(d <= rBDuration){
          setRDuration(d)
        }
        break;
      
      case 'StartHandle':
        let o = (pe.o+ne)-pe.left
        if(o >= 0){
          setRBOffset(o)
          setRStart(ne)
          setRDuration(pe.right-ne)
        }
        break;

      default:
        setRStart(snapCalc(pe.left) + delta)
        break;
    }
  },[mousePos])

  const mouseDown = (e)=>{
    e.preventDefault()
    preClick.current = {cx:e.pageX, left: rStart, width: rDuration, right:rStart+rDuration, o:rBOffset}
    setHandleHitbox(e.target.className)
  }
  const mouseUp = (e)=>{
    if(!e) return
    e.preventDefault()
    setHandleHitbox(null)

    if(e.pageX === preClick.current.cx) return
    const s = rStart/bar;
    const d = rDuration/bar;
    const o = rBOffset/bar;

    const newRegion = {...region, rStart:s, rDuration:d, rBufferOffset:o}
    // console.log({s,d,o})
    // console.log(region)
    // console.log(newRegion)
    setRegion(newRegion)
  }

  const pointerEvents = {width:resizeArea}

  return(<div
    className={handleHitbox ? 'AudioRegion AudioRegionDrag' : 'AudioRegion'} 
    style={{width: rDuration, left: rStart}}
    onMouseDown={mouseDown}
    onMouseUp={mouseUp}
    >
    <span className='StartHandle' style={pointerEvents}>|</span>
    <span style={{pointerEvents:'none'}}> {`${region.rPrev && region.rPrev.regionId.slice(-2)} < ${region.regionId.slice(-2)} > ${region.rNext && region.rNext.regionId.slice(-2)}`} </span>
    <span className='EndHandle' style={pointerEvents}>|</span>  
  </div>)
}

export default AudioRegion