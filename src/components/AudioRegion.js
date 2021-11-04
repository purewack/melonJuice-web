import './components.css';
import {useState,useEffect,useRef} from 'react'

const AudioRegion = ({region, setRegion, bar, shouldSnap, mousePos})=>{
  const [bStart, setBStart] = useState()
  const [bDuration, setBDuration] = useState()
  const [bOffset, setBOffset] = useState()
  const [drag, setDrag] = useState()
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
    if(!mousePos) mouseUp(null);
    if(!drag || !mousePos) return

    let pe = preClick.current
    let delta = snapCalc(mousePos - pe.cx)
    let ne = snapCalc(mousePos - 50)
    
    console.log({delta})

    switch (drag) {
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
    preClick.current = {cx:e.clientX, left: bStart, width: bDuration, right:bStart+bDuration, o:bOffset}
    setDrag(e.target.className)
  }
  const mouseUp = (e)=>{
    if(e)
    e.preventDefault()
    setDrag(null)
    let s = 1 + bStart/bar;
    let d = 1 + bDuration/bar;
    let o = 1 + bOffset/bar;
    console.log({s,d,o})
    //setRegion()
  }

  const pointerEvents = {width:resizeArea}

  return(<div
    className={drag ? 'AudioRegion AudioRegionDrag' : 'AudioRegion'} 
    style={{width: bDuration, left: bStart}}
    onMouseDown={mouseDown}
    onMouseUp={mouseUp}
    >
    <span className='StartHandle' style={pointerEvents}>|</span>
    <span> {bOffset} </span>
    <span className='EndHandle' style={pointerEvents}>|</span>  
  </div>)
}

export default AudioRegion