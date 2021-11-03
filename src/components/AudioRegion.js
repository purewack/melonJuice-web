import './components.css';
import {useState,useEffect,useRef} from 'react'

const AudioRegion = ({region, setRegion, bar, shouldSnap})=>{
  const [left, setLeft] = useState()
  const [width, setWidth] = useState()
  const [drag, setDrag] = useState()
  const [hover, setHover] = useState()
  const preClick = useRef()
  const resizeArea = 15;

  const collisionCalc = (x,r)=>{
    let d = 'center'
    if(x > r.left && x < r.left+resizeArea){
      d = 'left'
    } 
    if(x < r.right && x > r.right-resizeArea){
      d = 'right'
    }
    return d
  }
  const snapCalc = (ll)=>{
    if(shouldSnap){
      let b = (bar/shouldSnap)
      let l = Math.floor(ll/b)*b
      return l;
    }
    return ll
  }

  useEffect(()=>{
    setLeft(bar*region.timeStart)
    setWidth(bar*region.timeDuration)
  },[region,bar])

  const mouseDown = (e)=>{
    e.preventDefault()
    let x = e.clientX
    let r = e.target.getBoundingClientRect()
    preClick.current = {x ,r, left:snapCalc(left), width}
    setDrag(collisionCalc(x,r))

  }
  const mouseMove = (e)=>{
    e.preventDefault()
    let x = e.clientX
    let r = e.target.getBoundingClientRect()
    setHover(collisionCalc(x,r))
    if(!drag) return

    let pe = preClick.current
    let delta = snapCalc(e.clientX - pe.x )   
    switch (drag) {
      case 'right':
        setWidth(pe.width + delta)
        break;
      
      case 'left':
        setLeft(pe.left + delta)
        setWidth(pe.width - delta)
        break;

      default:
        setLeft(pe.left + delta)
        break;
    }

  }
  const mouseUp = (e)=>{
    e.preventDefault()
    setDrag(null)
    //setRegion()
  }

const pointerEvents = {pointerEvents:'none', width:resizeArea}

  return(<div 
    className={drag ? 'AudioRegion AudioRegionDrag' : 'AudioRegion'} 
    style={{width, left, cursor:((hover === 'center' || !hover) ? 'grab' : 'col-resize')}}
    onMouseDown={mouseDown}
    onMouseMove={mouseMove}
    onMouseUp={mouseUp}
    onMouseLeave={mouseUp}
    >
    <span className='StartHandle' style={pointerEvents}>|</span>
    <span></span>
    <span className='EndHandle' style={pointerEvents}>|</span>  
  </div>)
}

export default AudioRegion