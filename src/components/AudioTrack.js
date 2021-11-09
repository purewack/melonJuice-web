import {cloneElement, useState, useEffect, useRef} from 'react'
import AudioRegion from './AudioRegion';
import './components.css';

const AudioTrack = ({id, regions, tracksDispatch, armedId, barLength, snapGrain})=>{

    return(<div className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        {regions.map((r,j) => {
            let rr = <AudioRegion 
                key={j} 
                region={r} 
                tracksDispatch={tracksDispatch}
                barLength={barLength}
                snapGrain={snapGrain}
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