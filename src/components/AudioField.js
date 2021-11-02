import {useState,useEffect} from 'react'
import TimelineBar from './TimelineBar'

const AudioField = ({songMeasures, timer, bar, children}) => {
    
    const [bars, setBars] = useState()
    useEffect(()=>{
        setBars(Array(songMeasures).fill(null))
    },[bar,songMeasures])

    const [dragging, setDragging] = useState(false)
    const mouseDown = (e)=>{
        setDragging(true)
    }
    const mouseUp = (e)=>{
        setDragging(false)
    }

    return(<div className='AudioField' onMouseDown={mouseDown} onMouseUp={mouseUp}> 
        <span className='Timeline'>
            <div className='Playhead' style={{pointerEvents: dragging ? 'none' : ''}}></div>
            {bars && bars.map((b,i)=>{
                return (<TimelineBar bar={bar} number={i}/>)
            })}
        </span>
        {children}
    </div>)
}

export default AudioField