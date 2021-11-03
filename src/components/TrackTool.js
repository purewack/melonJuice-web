import React from 'react'

export default function TrackTool({id, armedId, onArm}) {
    return (
        <div className={armedId === id ? 'TrackTool TrackToolArmed' : 'TrackTool'}>
            <p>Icon</p>
            <div className='TrackToolHelper'>
                <button onClick={onArm}>Rec Arm</button>
                <button >Solo</button>
                <button >Mute</button>
            </div>
        </div>
    )
}
