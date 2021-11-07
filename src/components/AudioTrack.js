import {cloneElement, useState} from 'react'
import { useEffect, useRef} from 'react/cjs/react.development';
import AudioRegion from './AudioRegion';
import './components.css';

const AudioTrack = ({id, armedId, setRegion, onRegionSelect, bar, regions})=>{

    const [selectedRegion, setSelectedRegion] = useState()

    useEffect(()=>{
        console.log('new region select')
        console.log(selectedRegion)
    },[selectedRegion])

    return(<div className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        {regions.map((r,j) => {
            return <AudioRegion 
                key={j} 
                region={r} 
                setRegion={setRegion}
                onRegionSelect={onRegionSelect}
                bar={bar}
            />
        })}
    </div>)
}

export default AudioTrack