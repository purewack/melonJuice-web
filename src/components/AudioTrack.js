import './components.css';
import AudioRegion from './AudioRegion';

const AudioTrack = ({id, armedId, onArm, onSolo, onMute, children})=>{
    const dummy = Array(20)

    return(<div className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        <div className='AudioTrackHeading'>
            <p>Icon</p>
            <div className='AudioTrackHelper'>
                <button onClick={onArm}>Rec Arm</button>
                <button >Solo</button>
                <button >Mute</button>
            </div>
        </div>
        {children}
    </div>)
}

export default AudioTrack