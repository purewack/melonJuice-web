import {useState} from 'react'
import PointerHandle from '../interfaces/PointerHandle'

export default function PlayHead({pos, height, setPos, playPos}) {
    
    const [pOff, setPOff] = useState(0)
    const onDragDuring = ({dx})=>{
        setPOff(dx)
    }
    const onDragEnd = ({dx})=>{
        setPOff(0)
    }
    const xx = pos+pOff

    return (
        <svg className='PlayHead'>
            <PointerHandle onChange={onDragDuring} 
                bounds={{
                }}
            >
                <polygon points={`${xx},0 ${xx-10},-20 ${xx+10},-20`} fill='red'/>
            </PointerHandle>            
            
            <line x1={xx} x2={xx} y1={0} y2={height}/> 
        </svg>
    )
}