import { AudioEngine } from "../audio/AudioEngine"
import { contactType } from '../Util';
import newid from 'uniqid';

export function tracksReducer(state,action){
  const publishHistory = (newMove, changes)=>{
    const ch = newMove.map((t,i) => {
      return changes.some(v => i===v) 
    })
    
    if(state.historyPointer !== state.history.length-1){
      return {
        historyPointer: state.historyPointer+1,
        history:  [...state.history.slice(0,state.historyPointer+1), newMove],
        current: newMove,
        changes: ch,
      }
    }

    return {
      historyPointer: state.historyPointer+1,
      history:  [...state.history, newMove],
      current: newMove,
      changes: ch,
    }
  }

  const makeSpace = (destTrack, forRegion)=>{
    const u = forRegion

    let contacts = []
    destTrack.regions.forEach(r => {
      //dont check self
      if(u.regionId !== r.regionId){
        const ct = contactType(u.rOffset, u.rOffset+u.rDuration,  r.rOffset, r.rOffset+r.rDuration)
        if(ct !== null) {
          contacts.push({region:r, ...ct})
        }
      }
    })
    console.log(contacts)

    contacts.forEach(c => {
      //take action
      switch(c.type){
        case 'overcast':
          destTrack.regions = AudioEngine.removeRegion(destTrack.regions, c.region)
          break;
          
        case 'overlap':{
            const roff = (c.side === 'left' ? c.region.rOffset + c.dt : c.region.rOffset)
            const rr = {
              ...c.region, 
              rDuration: c.region.rDuration - c.dt,
              rOffset: roff,
              bOffset: c.region.bOffset + (roff-c.region.rOffset)
            }

            destTrack.regions = AudioEngine.updateRegion(destTrack.regions, rr)
          }
          break;
        case 'contains':{
          const rrLeft = {
            ...c.region, 
            regionId:newid(), 
            rDuration: c.left
          }

          const roff = c.region.rOffset + (c.region.rDuration - c.right)
          const rrRight = {
            ...c.region, 
            regionId:newid(), 
            rDuration: c.right,
            rOffset: roff,
            bOffset: c.region.bOffset + (roff-c.region.rOffset)
          }
          
          destTrack.regions = AudioEngine.removeRegion(destTrack.regions, c.region)
          destTrack.regions = AudioEngine.pushRegion(destTrack.regions, rrLeft)
          destTrack.regions = AudioEngine.pushRegion(destTrack.regions, rrRight)
          }
          break;

        default:
          break;
      }
    })

    //return destTrack
  }


  switch(action.type){
    case 'new':
      return {current: [AudioEngine.newTrack()], history: [[]], historyPointer:0, changes:[true] }

    case 'load':
      return {current: [...action.tracks], history: [[...action.tracks]], historyPointer:0, changes:action.tracks.map(t => {return true}) }

    case 'record_region':{
        let destTrackIdx
        let track
        const newMove = state.current.map((t,i) => {
          const tt = {...t, regions:[...t.regions.map(r => {return {...r}})]}
          if(action.trackId === t.trackId) {
            track = tt
            destTrackIdx = i
          }
          return tt
        })

        makeSpace(track, action.region)

        track.regions = AudioEngine.pushRegion(track.regions, action.region)

        return publishHistory(newMove, [destTrackIdx])
      }

    case 'update_region':{
      const u = action.updatedRegion
      let destTrack = null
      let sourceTrack = null
      let destTrackIdx = null
      let sourceTrackIdx = null
      console.log(u)

      const newMove = state.current.map((t,i) => {
        let jidx = (action.jumpRelativeTracks ? action.jumpRelativeTracks : 0)
        t.regions.forEach(r => {
          //find target region
          if(r.regionId === u.regionId){
            //find destination track
            let idx = i + jidx
            if(idx < 0) idx = 0
            if(idx > state.current.length-1) idx =  state.current.length-1
              destTrackIdx = idx
            sourceTrackIdx = i
          }
        })

        //make deep copy
        if(i === destTrackIdx)
        return {...t, regions:[...t.regions.map(r => {return {...r}})]}
        else
        return t
      })

      destTrack = newMove[destTrackIdx]
      sourceTrack = newMove[sourceTrackIdx]
      if(destTrackIdx !== sourceTrackIdx){
        sourceTrack.regions = AudioEngine.removeRegion(sourceTrack.regions, u)
      }

      makeSpace(destTrack, u)

      if(destTrackIdx !== sourceTrackIdx){
        destTrack.regions = AudioEngine.pushRegion(destTrack.regions, u)
      }
      else{
        destTrack.regions = AudioEngine.updateRegion(destTrack.regions, u)
      }

      return publishHistory(newMove, [sourceTrackIdx, destTrackIdx])
    }
    
    case 'cut_region':{
      const currentCopy = state.current.map(t => {
        return {...t, regions:[...t.regions]}
      })

      let destTrackIdx
      const newMove = currentCopy.map((t,i) => {
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
            r1.rFadeOut = 0
            r2.rFadeIn = 0
            outputTrack.regions = AudioEngine.setRegions([...trackNewRegions,r1,r2])
            destTrackIdx = i
          }
        }) 
        return outputTrack
      })

      return publishHistory(newMove, [destTrackIdx])
    }

    case 'undo':
      if(state.historyPointer > 0){
        return {
          ...state,
          current: state.history[state.historyPointer-1],
          historyPointer: state.historyPointer-1,
          changes: state.current.map(t=>true)
        }
      }
      break;
    case 'redo':
      if(state.historyPointer < state.history.length-1){
        return {
          ...state,
          current: state.history[state.historyPointer+1],
          historyPointer: state.historyPointer+1,
          changes: state.current.map(t=>true)
        }
      }
      break;
      
    default:
      return {
        ...state,
        changes: state.current.map(t=>false)
      };
  }
}


// const currentCopy = state.current.map((t,i) => {
//   let jidx = (action.jumpRelativeTracks ? action.jumpRelativeTracks : 0)
//   t.regions.forEach(r => {
//     if(r.regionId === u.regionId){
//       let idx = i + jidx
//       if(idx < 0) idx = 0
//       if(idx > state.current.length-1) idx =  state.current.length-1
//       destTrack = state.current[idx]
//       sourceTrack = t
//     }
//   })

//   //make deep copy
//   return {...t, regions:[...t.regions.map(r => {return {...r}})]}
// })

// let contacts = []
// destTrack.regions.forEach(r => {
//   //dont check self
//   if(u.regionId !== r.regionId){
//     const ct = contactType(u.rOffset, u.rOffset+u.rDuration,  r.rOffset, r.rOffset+r.rDuration)
//     if(ct != null) {
//       contacts.push({regionId:r.regionId, ...ct})
//       switch(ct.type){
//         case 'overcast':
//           break;
//       }
//     }
//   }
// })
// if(contacts.length){
//   console.log('detected contacts!')
//   console.log(contacts)
//   return {...state, current:currentCopy}
// }


// const newMove = currentCopy.map((t,i) => {
//   let tt = {...t}

//   if(destTrack.trackId !== sourceTrack.trackId){
//     if(sourceTrack.trackId === tt.trackId){
//       tt.regions = AudioEngine.removeRegion(tt.regions, action.updatedRegion)
//     }
//     else if(destTrack.trackId === tt.trackId){
//       tt.regions = AudioEngine.pushRegion(tt.regions, action.updatedRegion)
//     }
//   }
//   else
//     t.regions.forEach(r => {
//       if(r.regionId === u.regionId){
//           tt.regions = AudioEngine.updateRegion(tt.regions, action.updatedRegion)
//       }
//     }) 

//   return tt
// })