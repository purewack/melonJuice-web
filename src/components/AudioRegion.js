import './components.css';
import {useState,useEffect} from 'react'

const AudioRegion = ({region, setRegion, bar, shouldSnap})=>{
  const [left, setLeft] = useState()
  const [width, setWidth] = useState()
  const [draggedMove, setDraggedMove] = useState(false)
  const [draggedStart, setDraggedStart] = useState(false)
  const [draggedEnd, setDraggedEnd] = useState(false)
  const [xstart, setXstart] = useState()
  const [leftStart, setLeftstart] = useState(0)

  useEffect(()=>{
    setLeft(bar*region.timeStart)
    setWidth(bar*region.timeDuration)
  },[region,bar])

  const mouseDown = (e)=>{
    setDraggedMove(true)
    setXstart(e.clientX)
    setLeftstart(left)

    if(shouldSnap){
      let b = (bar/shouldSnap)
      let l = Math.floor(left/b)*b
      setLeft(l)
      setLeftstart(l)
    }

  }
  const mouseMove = (e)=>{
    e.preventDefault()
    if(!draggedMove) return;

    let delta = e.clientX-xstart
    if(shouldSnap) {
      let b = (bar/shouldSnap)
      delta = Math.floor(delta/b)*b
    }
    setLeft(leftStart + delta);
    
  }
  const mouseUp = (e)=>{
    setDraggedMove(false)
    //setRegion()
  }

  return(<div 
    className={draggedMove ? 'AudioRegion AudioRegionDrag' : 'AudioRegion'} 
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