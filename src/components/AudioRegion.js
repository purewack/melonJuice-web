import './components.css';
import {useState,useEffect,useRef} from 'react'

const AudioRegion = ({region, tracksDispatch, barLength, snapGrain})=>{

  const [rStart, setRStart] = useState()
  const [rDuration, setRDuration] = useState()
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
          let d = snapCalc(r.right + delta) - r.left
          
          if(d <= rBDuration){
            setRDuration(d)
          }
        }
        break;
      
      case 'StartHandle':{
        //let o = r.right-d
        let d = snapCalc(r.left + delta)
        console.log({rr:r.right-d, rBDuration})
        if(r.right-d <= rBDuration){
          //setRBOffset(o)
          setRStart(d)
          setRDuration(r.right-d)
        }
        }
        break;

      default:
        setRStart(snapCalc(r.left + delta))
        break;
    }
  }
  const mouseUp = (e)=>{
    window.removeEventListener('mouseup',mouseUp)
    window.removeEventListener('mousemove',mouseMove)
    setHandleHitbox(null)
    // let oldX = mouseStatsPrev.current
    // let x = e.pageX - 200
    // if(x === xOld) return

    // const s = rStart/barLength;
    // const d = rDuration/barLength;
    // const o = rBOffset/barLength;

    //const newRegion = {...region, rStart:s, rDuration:d, rBufferOffset:o}
    //tracksDispatch({type:'update_region', updatedRegion:newRegion})
  }  
  const mouseDown = (e)=>{   
    const target = e.target.className
    regionStatsPrev.current = {left: rStart, width: rDuration, right:rStart+rDuration, o:rBOffset, target, mouseDelta:0}
    setHandleHitbox(target)

    window.addEventListener('mouseup',mouseUp)
    window.addEventListener('mousemove',mouseMove)
    //window.addEventListener('mouseleave',mouseUp)
  }

  return(<div
    className={handleHitbox ? 'AudioRegion AudioRegionDrag' : 'AudioRegion'} 
    style={{width: rDuration, left: rStart}}
    onMouseDown={mouseDown}
    >
    <span className='StartHandle' style={{width:resizeArea}}>|</span>
    <span style={{pointerEvents:'none'}}> {`${region.rPrevId && region.rPrevId.slice(-2)} < ${region.regionId.slice(-2)} > ${region.rNextId && region.rNextId.slice(-2)}`} </span>
    <span className='EndHandle' style={{width:resizeArea}}>|</span>  
  </div>)
}

export default AudioRegion


// const [mouse, setMouse] = useState({event:'up', x:undefined, xOld:undefined, target:''})
// const mousedown = (e)=>{
//     e.preventDefault()
//     const offset = (audioFieldRef.current ? audioFieldRef.current.offsetLeft : 0)
//     initialMousePos.current = (e.pageX-offset)
//     //console.log(initialMousePos.current)
// }
// const mouseup = (e)=>{
//     if(selectedRegion){
//         const offset = (audioFieldRef.current ? audioFieldRef.current.offsetLeft : 0)
//         setMouse({type:'up', x:(e.pageX-offset), xOld:(initialMousePos.current)})
//         setSelectedRegion(null)
//     }
// }
// const mousemove = (e)=>{
//     if(selectedRegion){
//        const offset = (audioFieldRef.current ? audioFieldRef.current.offsetLeft : 0)
//        setMouse({ type:'move', x: (e.pageX-offset), xOld:(initialMousePos.current)})
//     }
// }
// // useEffect(()=>{
// //     console.log('new region select')
// //     console.log(selectedRegion)
// // },[selectedRegion])

// useEffect(()=>{
//     if(selectedRegion){
//         window.addEventListener('mouseup',mouseup)
//         window.addEventListener('mousemove',mousemove)
//         window.addEventListener('mouseleave',mouseup)
//     }

//     return ()=>{
//         window.removeEventListener('mouseup',mouseup)
//         window.removeEventListener('mousemove',mousemove)
//         window.removeEventListener('mouseleave',mouseup)
//     }
// },[selectedRegion])