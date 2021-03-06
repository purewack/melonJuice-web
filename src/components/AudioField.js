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
import '../css/Fields.css'
import '../css/Time.css'
import {useState,useEffect} from 'react'
import { useRenders } from '../Util'
import PlayHead from './PlayHead';

const AudioField = ({ songMeasures, timer, editorStats ,children, playHead, onNewPosPx}) => {
    useRenders('FIELD', 'red')

    const [bars, setBars] = useState()
    useEffect(()=>{
        setBars(Array(songMeasures).fill(null))
    },[songMeasures])

    return(<div className='AudioField' >
        <div className='Timeline'>
            <PlayHead stats={playHead} onNewPosPx={onNewPosPx}/>

            {bars && bars.map((b,i)=>{
                return (<div key={i}
                    className='TimelineBar'
                    style={{width: editorStats.beatLength*editorStats.beatBar }}>
                    { i}
                </div>)
            })}
        </div>

        {children}
    </div>)
}

export default AudioField