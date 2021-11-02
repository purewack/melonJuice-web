import React from 'react'

export default function TrackTool({id, armedId, onArm}) {
    return (
        <span className={armedId === id ? 'TrackTool TrackToolArmed' : 'TrackTool'}>
            <p>Icon</p>
            <span className='TrackToolHelper'>
                <button onClick={onArm}>Rec Arm</button>
                <button >Solo</button>
                <button >Mute</button>
            </span>
        </span>
    )
}
