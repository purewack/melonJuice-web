import {cloneElement, useState, useEffect, useRef} from 'react'
import AudioRegion from './AudioRegion';
import './components.css';

const AudioTrack = ({id, armedId, setRegion, onRegionSelect, mouseEvents, editorSettings, regions})=>{

    return(<div className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        {regions.map((r,j) => {
            let rr = <AudioRegion 
                key={j} 
                region={r} 
                setRegion={setRegion}
                onRegionSelect={onRegionSelect}
                editorSettings={editorSettings}
                mouseEvents={mouseEvents && mouseEvents.target === r.regionId ? mouseEvents.mouse : undefined}
            />
            return rr
            //return (r.regionId === selectedRegion.regionId ? 
            // <SelectedIndicator>
            //     {rr}
            // </SelectedIndicator>   
            // : rr)
        })}
    </div>)
}

export default AudioTrack