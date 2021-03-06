import {useState} from 'react'
import PointerHandle from '../interfaces/PointerHandle'

export default function PlayHead({stats, onNewPosPx}) {
    const {
        pos, 
        trackCount,
        trackHeight, 
        transportPx, 
        recordingDuration, 
        recordingStart,
        recordingTrackIdx,
    } = stats    
    
    const [pOff, setPOff] = useState(0)
    const onDragDuring = ({dx})=>{
        setPOff(dx)
    }
    const onDragEnd = ({dx})=>{
        setPOff(0)
        onNewPosPx(pos + dx)
    }
    const xx = pos+pOff
    const tr = `translate(${transportPx},0)`

    return (
        <svg className='PlayHead' width={1} height={1}>
            <PointerHandle onChange={onDragDuring} onEnd={onDragEnd} bounds={{minDX:-pos}}>
                <polygon transform={tr} points={`${xx},0 ${xx-10},-20 ${xx+10},-20`} fill='red'/>
            </PointerHandle>            
            
            <line transform={tr} x1={xx} x2={xx} y1={0} y2={trackHeight*trackCount}/>

            {recordingDuration ? <>
                <rect className="RecordingRegionIndicator" 
                    x={recordingStart} 
                    y={trackHeight*recordingTrackIdx} 
                    width={recordingDuration} 
                    height={trackHeight} 
                    fill={'rgba(255,0,0,0.4)'}
                />
            </> : null} 
        </svg>
    )
}