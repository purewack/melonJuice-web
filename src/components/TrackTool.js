import React from 'react'
import '../css/TrackTool.css'

export default function TrackTool({id, armedId, onArm, height}) {
    return (
        <div className={armedId === id ? 'TrackTool TrackToolArmed' : 'TrackTool'} style={{height}}>
            <p>Icon</p>
            <div className='TrackToolHelper'>
                <button onClick={onArm}>Rec Arm</button>
                <button >Solo</button>
                <button >Mute</button>
            </div>
        </div>
    )
}
