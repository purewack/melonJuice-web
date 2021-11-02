import {useState,useEffect} from 'react'
import TimelineBar from './TimelineBar'

const AudioField = ({songMeasures, timer, bar, children}) => {
    
    const [bars, setBars] = useState()
    useEffect(()=>{
        setBars(Array(songMeasures).fill(null))
    },[bar,songMeasures])

    return(<div className='AudioField'>
        <span className='AudioTimer'>{timer}</span>
        <span className='Timeline'>
            {bars && bars.map((b,i)=>{
                return (<TimelineBar bar={bar} number={i}/>)
            })}
        </span>
        {children}
    </div>)
}

export default AudioField