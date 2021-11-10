import AudioRegion from './AudioRegion';
import './components.css';

const AudioTrack = ({id, regions, tracksDispatch, armedId, editorStats})=>{

    return(<div className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        {regions.map((r,j) => {
            let rr = <AudioRegion 
                key={j} 
                region={r} 
                tracksDispatch={tracksDispatch}
                editorStats={editorStats}
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