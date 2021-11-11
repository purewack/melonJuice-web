import './components.css';

const AudioTrack = ({id, armedId, children})=>{

    return(<div className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        {children}
    </div>)
}

export default AudioTrack