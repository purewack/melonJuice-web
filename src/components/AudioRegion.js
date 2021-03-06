import '../css/AudioRegion.css';
import {useState,useEffect,useRef} from 'react'
import PointerHandle  from '../interfaces/PointerHandle';
//import{useRenders} from '../Util'

    /*      
                               │                    │
                               ├──────rDur──────────┤
        │                      │                    │
        ├─────────roff─────────┤
        │                      │
        │              ┌-------┼────────────────────┐
        │              │       │                    │
        │              │       │                    │
        │              └-------┼────────────────────┘
                               │
                       │       │                    │
                       │boff───┘                    │
                       │                            │
                       ├─bdur───────────────────────┤
                       │                            │
    */

const AudioRegion = ({region, selectedRegion, onSelect, trackInfo, tracksDispatch, editorStats})=>{

  const rOffset = (editorStats.beatLength * region.rOffset)
  const bOffset = (editorStats.beatLength * region.bOffset * region.rPlayrate)
  const rDuration = (editorStats.beatLength * region.rDuration) / region.rPlayrate
  const bDuration = (editorStats.beatLength * region.bDuration * editorStats.bps) / region.rPlayrate
  const rFadeIn = (editorStats.beatLength*region.rFadeIn)
  const rFadeOut = (editorStats.beatLength*region.rFadeOut)
  const maxHeight = (editorStats.trackHeight)
  const selected = selectedRegion && selectedRegion.regionId === region.regionId
  const isGrabbing = editorStats.toolMode === 'grab'
  const isFading = editorStats.toolMode === 'fade'
  const isCutting = editorStats.toolMode === 'cut'

  const snapVCalc = (ll)=>{
    let b = (maxHeight)
    let l = Math.floor(ll/b)*b
    return l;
  }
  const snapCalc = (ll, min, max, cancel)=>{
    if(editorStats.snapGrain && !cancel){
      let b = ((editorStats.beatLength*editorStats.beatBar)/editorStats.snapGrain)
      let l = Math.floor(ll/b)*b
      if(min !== null && l < min) l = min
      if(max !== null && l > max) l = max
     return l;
    }
    return ll
  }
  const selectHandler = ()=>{
      resetCutPos()
    if(selectedRegion)
    onSelect(null)
    else{
      onSelect(region)
    }
  } 
  const [rrDuration, setRRDuration] = useState(0)
  const [rrOffset, setRROffset] = useState(0)
  const [rrFadeIn, setRRFadeIn] = useState(0)
  const [rrFadeOut, setRRFadeOut] = useState(0)
  const [rrTransform, setRRTransform] = useState(0)
  const [cutHandleTransform, setCutHandleTransform] = useState(0)
  const [cutHandleLineTransform, setCutHandleLineTransform] = useState(0)
  const cutHandleDxx = useRef(0)
  const [cutPos, setCutPos] = useState(0)
  const [pointerState, setPointerState] = useState('')


  const onStartResizeHandler = ()=>{
    setPointerState('resize-change')
  }
  const onStartMoveChange = ()=>{
    setPointerState('move-change')
  }

  const onChangeDurationHandler = ({dx})=>{
    const left = rOffset
    const right = left+rDuration
    let dxx = snapCalc(dx)-(right - snapCalc(right))
    const max = (bDuration-bOffset)-rDuration
    if(dx === max) dxx = max 
    setRRDuration(dxx)

    const rwo = (rww+dxx)-(rFadeOut)
    const delta = rFadeIn - rwo
    if(delta > 0) setRRFadeIn(-delta)
    if(rFadeOut > (rww+dxx)) setRRFadeOut((rww+dxx)-(rFadeOut)) 
  }
  const onEndDurationHandler = ({dx})=>{
    setPointerState('')
    if(dx === 0) return

    const left = rOffset
    const right = left+rDuration
    let dxx = snapCalc(dx)-(right - snapCalc(right))
    const max = (bDuration-bOffset)-rDuration
    if(dx === max) dxx = max 
    const rd = (rDuration + dxx)/editorStats.beatLength

    const rwo = (rww+dxx)-(rFadeOut)
    const delta = rFadeIn - rwo
    const fi = delta > 0 ? (rFadeIn-delta) / editorStats.beatLength : region.rFadeIn
    const fo = rFadeOut>(rww+dxx) ? (rww+dxx) / editorStats.beatLength : region.rFadeOut
 
    tracksDispatch({
      type:'update_region',
      updatedRegion: {...region, rDuration:rd, rFadeIn:Math.max(fi,0), rFadeOut:Math.max(fo,0)},
      jumpRelativeTracks:0,
    })
  }

  const onChangeOffsetHandler = ({dx})=>{
    let dxx = snapCalc(dx)-(rOffset - snapCalc(rOffset))
    if(dxx <= -bOffset) dxx = -bOffset
    setRROffset(dxx)
    setRRDuration(-dxx)
    setRRTransform(`translateX(${rOffset + dxx}px)`)
    
    const rwo = (rww-dxx)-(rFadeOut)
    const delta = rFadeIn - rwo
    if(delta > 0) setRRFadeOut(-delta)
    if(rFadeIn > (rww-dxx)) setRRFadeIn((rww-dxx)-(rFadeIn))
    
  }
  const onEndOffsetHandler = ({dx})=>{
    setPointerState('')
    if(dx === 0) return

    let dxx = snapCalc(dx)-(rOffset - snapCalc(rOffset))
    if(dxx <= -bOffset) dxx = -bOffset
    const ro = (rOffset + dxx)/editorStats.beatLength
    const rd = (rDuration - dxx)/editorStats.beatLength
    const bo = (bOffset + dxx)/editorStats.beatLength
    
    const rwo = (rww-dxx)-(rFadeOut)
    const delta = rFadeIn - rwo
    const fo = delta > 0 ? (rFadeOut-delta) / editorStats.beatLength : region.rFadeOut
    const fi = rFadeIn>(rww-dxx) ? (rww-dxx) / editorStats.beatLength : region.rFadeIn

    tracksDispatch({
      type:'update_region',
      updatedRegion: {...region, bOffset:bo, rOffset:ro, rDuration:rd, rFadeIn:Math.max(fi,0), rFadeOut:Math.max(fo,0)},
      jumpRelativeTracks:0,
    })
  }

  const onChangeGrabHandler = ({dx, dy})=>{
    const dxx = snapCalc(dx)-(rOffset - snapCalc(rOffset))
    setRRTransform(`translateX(${rOffset + dxx}px) translateY(${snapVCalc(dy + editorStats.trackHeight/2)}px)`)
  }
  const onEndGrabHandler = ({dx, dy})=>{
    setPointerState('')
    if(dx === 0) return

    const jumps = (snapVCalc(dy + editorStats.trackHeight/2)/editorStats.trackHeight)
    const dxx = snapCalc(dx)-(rOffset - snapCalc(rOffset))
    const ro = (rOffset + dxx)/editorStats.beatLength
      tracksDispatch({
       type:'update_region',
       updatedRegion: {...region, rOffset:ro},
       jumpRelativeTracks:jumps,
      })
  }

  const resetCutPos = ()=>{
    setCutPos(rDuration/2)
    setCutHandleTransform(`translate(${rDuration/2},0)`)
    setCutHandleLineTransform(`translate(${rDuration/2},0)`)
  }
  const onChangeCutHandler = ({dx, dy, prev_dy})=>{
    if(dy+15 < -editorStats.trackHeight) return

    const max = rDuration-cutPos;
    let dxx = snapCalc(rOffset + cutPos + dx) - rOffset//snapCalc(dx)-(rOffset - snapCalc(rOffset))
    if(dxx < 0) dxx = 0
    else if(dx === max) dxx = rDuration

    const cutBonudary = -20
    if(dy > cutBonudary) cutHandleDxx.current = dxx
    const th = `translate(${cutHandleDxx.current}, ${dy <= cutBonudary ? dy : 0})`
    const thl = `translate(${cutHandleDxx.current}, 0)`
    setCutHandleTransform(th)
    setCutHandleLineTransform(thl)

    if(editorStats.trackHeight+dy <= 0 && editorStats.trackHeight+prev_dy > 0) {
      if(dxx === 0 || dxx === rDuration) return
      const cp = dxx
      const cutPosCommit = (cp/editorStats.beatLength)
      onSelect(null)
      tracksDispatch({type:'cut_region',regionToCut:region,regionCutLength:cutPosCommit})
    }
  }
  const onEndCutHandler = ({dx,dy}) => {
    const max = rDuration-cutPos;
    let dxx = snapCalc(rOffset + cutPos + dx) - rOffset//snapCalc(dx)-(rOffset - snapCalc(rOffset))
    if(dxx < 0) dxx = 0
    else if(dx === max) dxx = rDuration
    
    setCutPos(dxx)
    const th = `translate(${dxx}, 0)`
    const thl = th
    setCutHandleTransform(th)
    setCutHandleLineTransform(thl)
  }

 
  const onChangeFadeInHandler = ({dx})=>{
    setRRFadeIn(dx)
  }
  const onEndFadeInHandler = ({dx})=>{
    const rfi = (rFadeIn+dx)/editorStats.beatLength
    tracksDispatch({
      type:'update_region',
      updatedRegion: {...region, rFadeIn:rfi},
      jumpRelativeTracks:0,
    })
  }

  const onChangeFadeOutHandler = ({dx})=>{
    setRRFadeOut(-dx)
  }
  const onEndFadeOutHandler = ({dx})=>{
    const rfo = (rFadeOut-dx)/editorStats.beatLength
    tracksDispatch({
      type:'update_region',
      updatedRegion: {...region, rFadeOut:rfo},
      jumpRelativeTracks:0,
    })
  }

  useEffect(()=>{
    setRRDuration(0)
    setRROffset(0)
    setRRFadeIn(0)
    setRRFadeOut(0)
    setRRTransform(`translateX(${rOffset}px)`)
    setPointerState('')
    resetCutPos()
  // eslint-disable-next-line
  },[region,editorStats])
  
  const styleRegion = {
    position:'absolute',
    width:rDuration,
    height:maxHeight,
    left: 0,
    transform: rrTransform,
    overflow:'visible',
  } 

  const rww = rDuration + rrDuration;
  const vh = maxHeight*0.9;
  const vy = maxHeight*0.05;

  
  return(<>
  <PointerHandle disable={!(selected && isGrabbing)} 
    bounds={{
      minDX:-rOffset,
      minDY:-(trackInfo.idx * editorStats.trackHeight),
      maxDY:(trackInfo.max-1-trackInfo.idx)*editorStats.trackHeight,
    }} 
    onStart={onStartMoveChange} onChange={onChangeGrabHandler} onEnd={onEndGrabHandler}>
  <svg xmlns="http://www.w3.org/2000/svg"
    style={styleRegion} 
    onClick={!selected ? selectHandler : null} 
    className={selected ? 'AudioRegion AudioRegionSelected' : 'AudioRegion'}
    >
    
    
    <defs>
      <clipPath id={`svgframe-${region.regionId}`}>
        <rect y={vy} width={rww} height={vh} rx="10" ry="10"></rect>
      </clipPath>
      <clipPath id={`fadeinclip`}>
        <rect x={0} y={0} width={maxHeight/4} height={maxHeight/2}></rect>
      </clipPath>
      <clipPath id={`fadeoutclip`}>
        <rect x={maxHeight/4} y={0} width={maxHeight/4} height={maxHeight/2}></rect>
      </clipPath>
    </defs>


    <g clipPath={`url(#svgframe-${region.regionId})`}> 
      <rect fill={trackInfo.color} width={rww} height={maxHeight}></rect>
      <line y1={maxHeight/2} y2={maxHeight/2} x1={0} x2={rww} strokeWidth={2} stroke={'white'}></line>
      <use fill='white' href={`#waveform-${region.bufferId}`} y={0} x={-rrOffset-bOffset} width={bDuration} height={maxHeight}/>
      <path className="FadeSVG" d={`M 0,${maxHeight} Q 0,${maxHeight/4} ${rFadeIn+rrFadeIn},${vy} L 0,${vy} L 0,${maxHeight}`} />
      <path className="FadeSVG" d={`M ${rww-(rFadeOut+rrFadeOut)},${vy} Q ${rww},${maxHeight/4} ${rww},${maxHeight} L ${rww},${vy} L ${rww-(rFadeOut+rrFadeOut)},${vy}`} />
      <rect className="FrameSVG" y={vy} width={rww} height={vh} rx={10} ry={10}></rect>
    </g>
    
    { selected && isGrabbing ? <>
      <PointerHandle bounds={{
          minDX:-bOffset, 
          maxDX:bDuration-bOffset,
        }}  
        onStart={onStartResizeHandler} onChange={onChangeOffsetHandler} onEnd={onEndOffsetHandler}>
        <use className="HandleShadow" href="#melonhandle" x={-maxHeight/4} y={maxHeight/4} height={maxHeight/2} width={maxHeight/2}></use>
      </PointerHandle>
      <PointerHandle bounds={{
          minDX:-rDuration, 
          maxDX:(bDuration-bOffset)-rDuration,
        }} 
        onStart={onStartResizeHandler} onChange={onChangeDurationHandler} onEnd={onEndDurationHandler}>
        <use className="HandleShadow" href="#melonhandle" x={rww-maxHeight/4} y={maxHeight/4} height={maxHeight/2} width={maxHeight/2}></use>
      </PointerHandle> 
      </>
      :
      null 
    }

    { selected && isFading ? <>
      <PointerHandle bounds={{
          minDX:-rFadeIn,
          maxDX:(rDuration-rFadeOut)-rFadeIn,
        }}
        onChange={onChangeFadeInHandler} onEnd={onEndFadeInHandler}>
        <use href="#melonhandle" clipPath='url(#fadeinclip)' x={rFadeIn+rrFadeIn-maxHeight/4} y={-maxHeight/2} height={maxHeight/2} width={maxHeight/2}></use>
      </PointerHandle>
      <PointerHandle bounds={{
          minDX:-(rDuration-rFadeOut)+rFadeIn,
          maxDX:rFadeOut,
        }} 
        onChange={onChangeFadeOutHandler} onEnd={onEndFadeOutHandler}>
        <use href="#melonhandle" clipPath='url(#fadeoutclip)' x={rww - (rFadeOut+rrFadeOut + (maxHeight/4))} y={-maxHeight/2} height={maxHeight/2} width={maxHeight/2}></use>
      </PointerHandle>
      </>
      :
      null 
    }

    {selected && isCutting ? <> 
      <line className="HandleShadow" stroke-width={2} stroke={'green'} x1={0} x2={0} y1={0} y2={maxHeight} transform={cutHandleLineTransform}></line>
      <PointerHandle bounds={{
        minDX:-cutPos,
        maxDX:rDuration-cutPos,
      }}        
      onChange={onChangeCutHandler} onEnd={onEndCutHandler}>
        <use className="HandleShadow" href="#melonhandle" transform={cutHandleTransform} x={-maxHeight/4} y={maxHeight*3/4} height={maxHeight/2} width={maxHeight/2}></use>
      </PointerHandle> 
    </> : null}

  </svg>
  </PointerHandle>

  {pointerState === 'resize-change' ? <div style={{position:'absolute',top:vy, left: rOffset-bOffset, width: bDuration, height: vh}} className='AudioRegion AudioRegionGhostBuffer'></div> : null}   
  {pointerState === 'move-change' ? <div style={{position:'absolute',top:vy, left: rOffset, width: rDuration, height:vh}} className='AudioRegion AudioRegionGhostMove'></div> : null}   

  </>
  )
}

export default AudioRegion