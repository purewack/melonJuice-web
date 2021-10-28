import './components.css';

const AudioRegion = ({visBuffer, zoom})=>{
  const duration = 2;

  return(<div className='AudioRegion' style={{width:(zoom*duration)}}>
    <span></span>
      Audio region
    <span></span>  
  </div>)
}

export default AudioRegion