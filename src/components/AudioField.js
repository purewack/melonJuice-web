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

import {useState,useEffect,cloneElement} from 'react'
import AudioTrack from './AudioTrack'
import TimelineBar from './TimelineBar'

const AudioField = ({ songMeasures, timer, bar, children}) => {

    const [bars, setBars] = useState()
    useEffect(()=>{
        setBars(Array(songMeasures).fill(null))
    },[bar,songMeasures])


    const [mousePressed, setMousePressed] = useState(false)
    const mousedown = (e)=>{
        //console.log('m down')
        setMousePressed(true)

    }
    const mouseup = (e)=>{
        //console.log('m up')
        setMousePressed(false)

    }
    const mousemove = (e)=>{
        if(mousePressed){
           //console.log('m move')
           
        }
    }

    // useEffect(()=>{
    //     window.addEventListener('mousedown',mousedown)
    //     window.addEventListener('mouseup',mouseup)
    //     window.addEventListener('mousemove',mousemove)

    //     return ()=>{
    //         window.removeEventListener('mousedown',mousedown)
    //         window.removeEventListener('mouseup',mouseup)
    //         window.removeEventListener('mousemove',mousemove)
    //     }
    // },[mousePressed])


    return(<div className='AudioField' style={{backgroundColor:'red'}}
        onMouseDown={mousedown}
        onMouseUp={mouseup}
        onMouseMove={mousemove}
    >
        <span className='Timeline'>
            <div className='Playhead'></div> 
            {bars && bars.map((b,i)=>{
                return (<div key={i}
                    className='TimelineBar'
                    style={{width:bar}}>
                    {1+ i}
                </div>)
            })}
        </span>

        {children}
        
    </div>)
}

export default AudioField