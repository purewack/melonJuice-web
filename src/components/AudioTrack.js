import {cloneElement, useState} from 'react'
import './components.css';

const AudioTrack = ({id, armedId, onArm, onSolo, onMute, children})=>{
    
    const [mousePos, setMousePos] = useState()
    const [drag, setDrag] = useState(false)

    return(<div className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}
    onMouseDown={(e)=>{
        e.preventDefault()
        setDrag(true)
    }}
    onMouseUp={(e)=>{
        e.preventDefault()
        setDrag(false)
        setMousePos(null); 
    }}
    onMouseLeave={(e)=>{
        e.preventDefault()
        setDrag(false)
        setMousePos(null); 
    }}
    onMouseMove={(e)=>{
        e.preventDefault()
        if(drag) setMousePos(e.pageX)
    }}
    >
        {children.map(c => {
            return cloneElement(c, { mousePos })
        })}
    </div>)
}

export default AudioTrack