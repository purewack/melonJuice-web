export const intersectCheck = (colider_start, colider_end, target_start, target_end) => {
    return ( 
        (colider_start+colider_end >= target_start && colider_start+colider_end <= target_start+target_end) 
        || (colider_start >= target_start && colider_start <= target_start+target_end) 
    )
}
