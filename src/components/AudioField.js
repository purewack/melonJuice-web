// import {useState,useEffect} from 'react'
// import TimelineBar from './TimelineBar'

// const AudioField = ({ songMeasures, timer, bar, children}) => {

//     const [bars, setBars] = useState()
//     useEffect(()=>{
//         setBars(Array(songMeasures).fill(null))
//     },[bar,songMeasures])

//     // const [dragging, setDragging] = useState(false)
//     // const mouseDown = (e)=>{
//     //     setDragging(true)
//     // }
//     // const mouseUp = (e)=>{
//     //     setDragging(false)
//     // }

//     return(<div className='AudioField' >
//         <span className='Timeline'>
//             {/* <div className='Playhead'></div> */}
//             {bars && bars.map((b,i)=>{
//                 return (<TimelineBar key={i} bar={bar} number={i}/>)
//             })}
//         </span>

//         <div className='TrackField'>
//             {children}
//         </div>
//     </div>)
// }

// export default AudioField

import {useRef, useState,useEffect,cloneElement} from 'react'
import AudioTrack from './AudioTrack'
import TimelineBar from './TimelineBar'

const AudioField = ({ songMeasures, timer, barLength, snapGrain ,children}) => {
    
    const [bars, setBars] = useState()
    useEffect(()=>{
        setBars(Array(songMeasures).fill(null))
    },[songMeasures])

    const audioFieldRef = useRef()
    const initialMousePos = useRef()
   
    const [selectedRegion, setSelectedRegion] = useState()
    const [mouse, setMouse] = useState({event:'up', x:undefined, xOld:undefined, target:''})
    const mousedown = (e)=>{
        e.preventDefault()
        const offset = (audioFieldRef.current ? audioFieldRef.current.offsetLeft : 0)
        initialMousePos.current = (e.pageX-offset)
        //console.log(initialMousePos.current)
    }
    const mouseup = (e)=>{
        if(selectedRegion){
            const offset = (audioFieldRef.current ? audioFieldRef.current.offsetLeft : 0)
            setMouse({type:'up', x:(e.pageX-offset), xOld:(initialMousePos.current)})
            setSelectedRegion(null)
        }
    }
    const mousemove = (e)=>{
        if(selectedRegion){
           const offset = (audioFieldRef.current ? audioFieldRef.current.offsetLeft : 0)
           setMouse({ type:'move', x: (e.pageX-offset), xOld:(initialMousePos.current)})
        }
    }
    // useEffect(()=>{
    //     console.log('new region select')
    //     console.log(selectedRegion)
    // },[selectedRegion])

    useEffect(()=>{
        if(selectedRegion){
            window.addEventListener('mouseup',mouseup)
            window.addEventListener('mousemove',mousemove)
            window.addEventListener('mouseleave',mouseup)
        }

        return ()=>{
            window.removeEventListener('mouseup',mouseup)
            window.removeEventListener('mousemove',mousemove)
            window.removeEventListener('mouseleave',mouseup)
        }
    },[selectedRegion])

    return(<div ref={audioFieldRef} className='AudioField' style={{backgroundColor:'red'}} onMouseDown={mousedown}>
        <span className='Timeline'>
            {/* <div className='Playhead'></div>  */}
            {bars && bars.map((b,i)=>{
                return (<div key={i}
                    className='TimelineBar'
                    style={{width:barLength}}>
                    {1+ i}
                </div>)
            })}
        </span>

        {children.map(c => {
            let p = {
                onRegionSelect:(r)=>{ 
                    setMouse({type:'down'})
                    setSelectedRegion(r)
                },
                mouseEvents:(selectedRegion ? {mouse, target:selectedRegion.regionId} : undefined),
            }
            return cloneElement(c,p)
        })}
        
    </div>)
}

export default AudioField