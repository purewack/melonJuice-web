import './components.css';
import {useState,useEffect} from 'react'

const AudioRegion = ({region, setRegion, bar, shouldSnap})=>{
  const [left, setLeft] = useState()
  const [width, setWidth] = useState()
  const [dragged, setDragged] = useState(false)
  const [xstart, setXstart] = useState()
  const [leftStart, setLeftstart] = useState(0)

  useEffect(()=>{
    setLeft(bar*region.timeStart)
    setWidth(bar*region.timeDuration)
  },[region,bar])

  const mouseDown = (e)=>{
    setDragged(true)
    setXstart(e.clientX)
    setLeftstart(left)

    if(shouldSnap){
      let b = (bar/shouldSnap)
      let l = Math.floor(left/b)*b
      setLeft(l)
      setLeftstart(l)
    }

    console.log('----')
    console.log({left, leftStart})
    console.log('----')
  }
  const mouseMove = (e)=>{
    e.preventDefault()
    if(!dragged) return;

    let delta = e.clientX-xstart
    if(shouldSnap) {
      let b = (bar/shouldSnap)
      delta = Math.floor(delta/b)*b
    }
    setLeft(leftStart + delta);
    
    console.log({left, leftStart})
  }
  const mouseUp = (e)=>{
    setDragged(false)
    //setRegion()
  }

  return(<div 
    className={dragged ? 'AudioRegion AudioRegionDrag' : 'AudioRegion'} 
    style={{width, left}}
    onMouseDown={mouseDown}
    onMouseMove={mouseMove}
    onMouseUp={mouseUp}
    onMouseLeave={mouseUp}
    >
    <span>S </span>
    <span> E</span>  
  </div>)
}

export default AudioRegion