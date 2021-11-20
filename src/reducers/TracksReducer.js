import { AudioEngine } from "../audio/AudioEngine"
import { isOverlapping } from '../Util';
import newid from 'uniqid';

export function tracksReducer(state,action){
  switch(action.type){
    case 'new':
      return {current: [AudioEngine.newTrack()], history: [[]], historyPointer:0}

    case 'load':
      return {current: [...action.tracks], history: [[...action.tracks]], historyPointer:0}

    case 'update_region':{
      const u = action.updatedRegion
      let destTrack = null
      let sourceTrack = null
      
      const currentCopy = state.current.map((t,i) => {
        let jidx = (action.jumpRelativeTracks ? action.jumpRelativeTracks : 0)

        t.regions.forEach(r => {
          if(r.regionId === u.regionId){
            const idx = i + jidx
            if(idx >= 0 && idx < state.current.length)
              destTrack =  state.current[idx]
            sourceTrack = t
          }
        })

        //make deep copy
        return {...t, regions:[...t.regions.map(r => {return {...r}})]}
      })

      // let overlaps = []
      // destTrack.regions.forEach(r => {
      //   //dont check self
      //   if(u.regionId !== r.regionId)
      //     if(isOverlapping(u.rOffset, u.rOffset+u.rDuration,  r.rOffset, r.rOffset+r.rDuration)) overlaps.push(r)
      // })
      
      // //bail early if illegal move
      // if(overlaps.length){
      //   return {...state, current:currentCopy}
      // }

      const newMove = currentCopy.map((t,i) => {
        let tt = {...t}

        if(destTrack.trackId !== sourceTrack.trackId){
          if(sourceTrack.trackId === tt.trackId){
            tt.regions = AudioEngine.removeRegion(tt.regions, action.updatedRegion)
          }
          else if(destTrack.trackId === tt.trackId){
            tt.regions = AudioEngine.pushRegion(tt.regions, action.updatedRegion)
          }
        }
        else
          t.regions.forEach(r => {
            if(r.regionId === u.regionId){
                tt.regions = AudioEngine.updateRegion(tt.regions, action.updatedRegion)
            }
          }) 

        return tt
      })

      if(state.historyPointer !== state.history.length-1){
        //console.log(state.history.slice(0,state.historyPointer+1))
        return {
          historyPointer: state.historyPointer+1,
          history:  [...state.history.slice(0,state.historyPointer+1), newMove],
          current: newMove,
        }
      }

      return {
        historyPointer: state.historyPointer+1,
        history:  [...state.history, newMove],
        current: newMove,
      }
    }
    
    case 'cut_region':{
      const currentCopy = state.current.map(t => {
        return {...t, regions:[...t.regions]}
      })

      const newMove = currentCopy.map(t => {
        let outputTrack = t
        t.regions.forEach(r => {
          if(r.regionId === action.regionToCut.regionId){
            let r1 = AudioEngine.cloneRegion(action.regionToCut)
            let r2 = AudioEngine.cloneRegion(action.regionToCut)
            const trackNewRegions = AudioEngine.removeRegion(outputTrack.regions, action.regionToCut)
            r1.rDuration = action.regionCutLength
            r2.rDuration -= action.regionCutLength
            r2.bOffset += action.regionCutLength
            r2.rOffset += action.regionCutLength
            r1.regionId = newid()
            r2.regionId = newid()
            outputTrack.regions = AudioEngine.setRegions([...trackNewRegions,r1,r2])
          }
        }) 
        return outputTrack
      })

      if(state.historyPointer !== state.history.length-1){
        //console.log(state.history.slice(0,state.historyPointer+1))
        return {
          historyPointer: state.historyPointer+1,
          history:  [...state.history.slice(0,state.historyPointer+1), newMove],
          current: newMove,
        }
      }

      return {
        historyPointer: state.historyPointer+1,
        history:  [...state.history, newMove],
        current: newMove,
      }
    }

    case 'undo':
      if(state.historyPointer > 0){
        return {
          ...state,
          current: state.history[state.historyPointer-1],
          historyPointer: state.historyPointer-1,
        }
      }
      break;
    case 'redo':
      if(state.historyPointer < state.history.length-1){
        return {
          ...state,
          current: state.history[state.historyPointer+1],
          historyPointer: state.historyPointer+1,
        }
      }
      break;
      
    default:
      return state;
  }
}
