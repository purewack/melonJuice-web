import {cloneElement, useState} from 'react'
import { useEffect, useRef} from 'react/cjs/react.development';
import './components.css';

const AudioTrack = ({id, armedId, onArm, onSolo, onMute, children})=>{
    
    const audioTrackRef = useRef()
    const [mouseOffset, setMouseOffset] = useState()
    const [mousePos, setMousePos] = useState()
    const [drag, setDrag] = useState(false)

    useEffect(()=>{
        if(audioTrackRef.current){
            setMouseOffset(audioTrackRef.current.offsetLeft)
        }
    },[audioTrackRef])

    return(<div ref={audioTrackRef} className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}
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
            return cloneElement(c, { mousePos, mouseOffset})
        })}
    </div>)
}

export default AudioTrack