import {useState} from 'react'
import './components.css';
import AudioRegion from './AudioRegion';


const AudioTrack = ({id, armedId, onArm, onSolo, onMute, children})=>{
 
    return(<div className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        <div className="content">
            {children}
        </div>
    </div>)
}

export default AudioTrack