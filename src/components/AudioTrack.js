import './components.css';
import AudioRegion from './AudioRegion';

const AudioTrack = ({id, armedId, onArm, clips})=>{

    return(<div className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        <button onClick={onArm}>Rec Arm</button>
        {clips && clips.map((c,i) => {
            return <AudioRegion key={i}/>
        })}
    </div>)
}

export default AudioTrack