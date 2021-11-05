export const intersectCheck = (colider_start, colider_end, target_start, target_end) => {
    return ( 
        (colider_start+colider_end >= target_start && colider_start+colider_end <= target_start+target_end) 
        || (colider_start >= target_start && colider_start <= target_start+target_end) 
    )
}

export const calculateRegionRelations = (regions) => {
    let sorted = regions.sort((a,b)=>{
        if(a.rStart < b.rStart){
            return -1
        }
        else if(a.rStart > b.rStart){
            return 1
        }
        else return 0
    })

    return sorted.map((r,i,a) => {
        r.rPrev = (i>0 ? a[i-1] : null)
        r.rNext = (i<a.length-1 ? a[i+1] : null)
        return r
    })
}
