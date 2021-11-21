import './components.css';

const AudioTrack = ({id, armedId, children, editorStats})=>{
    
    return(<div style={{height:editorStats.trackHeight}} className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        <p style={{position:'absolute'}}> {id} </p>
        {children}
    </div>)
}

export default AudioTrack