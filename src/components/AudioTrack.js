import './components.css';

const AudioTrack = ({id, armedId, children, editorStats})=>{
    
    return(<div style={{height:editorStats.trackHeight}} className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        
        {children}

    </div>)
}

export default AudioTrack