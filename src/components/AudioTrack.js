import '../css/AudioTrack.css';
import { useRenders } from '../Util';
import {memo} from 'react';

const AudioTrack = ({hadChanges, id, armedId, children, editorStats})=>{
    
    useRenders(id, 'green')
    console.log(hadChanges)
    
    return(<div style={{height:editorStats.trackHeight}} className={armedId === id ? 'AudioTrack AudioTrackArmed' : 'AudioTrack'}>
        
        {children}

    </div>)
}

export default memo(AudioTrack,(prevProps,nextProps)=>{
    return !nextProps.hadChanges 
})