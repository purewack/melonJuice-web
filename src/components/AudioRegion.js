import './components.css';
import {useState,useEffect,useRef} from 'react'

const AudioRegion = ({region, setRegion, bar, shouldSnap, mousePos})=>{
  const [left, setLeft] = useState()
  const [width, setWidth] = useState()
  const [drag, setDrag] = useState()
  const preClick = useRef()
  const resizeArea = 10;

  const snapCalc = (ll)=>{
    if(shouldSnap){
      let b = (bar/shouldSnap)
      let l = Math.floor(ll/b)*b
      console.log(l);
      return l;
    }
    return ll
  }

  useEffect(()=>{
    setLeft(bar*region.timeStart)
    setWidth(bar*region.timeDuration)
  },[region,bar])

  useEffect(()=>{
    if(!mousePos) mouseUp(null);
    if(!drag || !mousePos) return
    let pe = preClick.current
    let delta = snapCalc(mousePos - pe.x )
    switch (drag) {
      case 'EndHandle':
        setWidth(snapCalc(mousePos + delta) - (pe.left - 50))
        break;
      
      case 'StartHandle':
        setLeft(pe.left + delta)
        setWidth(pe.width - delta)
        break;

      default:
        setLeft(pe.left + delta)
        break;
    }
  },[mousePos])

  const mouseDown = (e)=>{
    e.preventDefault()
    preClick.current = {x:e.clientX ,left:snapCalc(left), width}
    setDrag(e.target.className)
  }
  const mouseUp = (e)=>{
    if(e)
    e.preventDefault()
    setDrag(null)
    let s = 1 + left/bar;
    let d = 1 + width/bar;
    console.log({s,d})
    //setRegion()
  }

  const pointerEvents = {width:resizeArea}

  return(<div
    className={drag ? 'AudioRegion AudioRegionDrag' : 'AudioRegion'} 
    style={{width, left}}
    onMouseDown={mouseDown}
    onMouseUp={mouseUp}
    >
    <span className='StartHandle' style={pointerEvents}>|</span>
    <span> </span>
    <span className='EndHandle' style={pointerEvents}>|</span>  
  </div>)
}

export default AudioRegion