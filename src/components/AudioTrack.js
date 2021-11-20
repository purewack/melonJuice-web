import { useRenders } from '../Util';
import './components.css';

const AudioTrack = ({id, armedId, children, editorStats})=>{
    
    //useRenders(id,'blue')

    return(<div style={{height:editorStats.trackHeight}} className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        <p style={{position:'absolute'}}> {id} </p>
        {children}
    </div>)
}

export default AudioTrack