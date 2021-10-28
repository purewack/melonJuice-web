const AudioField = ({songMeasures, timer, zoom, children}) => {
    const bars = Array(songMeasures).fill(null)

    return(<div className='AudioField'>
        <span className='AudioTimer'>{timer}</span>
        <span className='AudioTimeline'>
            {bars.map((b,i)=>{
                return (<div key={i} style={{width:zoom}}>{1+ i}</div>)
            })}
        </span>
        {children}
    </div>)
}

export default AudioField