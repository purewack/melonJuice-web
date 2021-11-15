import { useRenders } from '../Util';
import './components.css';

const AudioTrack = ({id, armedId, children})=>{
    
    useRenders(id,'blue')

    return(<div className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        {children}
    </div>)
}

export default AudioTrack