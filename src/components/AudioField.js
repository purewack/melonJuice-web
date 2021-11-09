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

import {useState,useEffect} from 'react'

const AudioField = ({ songMeasures, timer, barLength, snapGrain ,children}) => {
    
    const [bars, setBars] = useState()
    useEffect(()=>{
        setBars(Array(songMeasures).fill(null))
    },[songMeasures])

    return(<div className='AudioField' style={{backgroundColor:'red'}} >
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

        {children}
    </div>)
}

export default AudioField