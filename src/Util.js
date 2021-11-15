
import { useRef } from "react"

export const isOverlapping = (a,b, c,d) => {
    console.log({a,b,c,d})
    return !(a > d || c > b)

    //   A-----B
    // C---------D
    //
    // A--------B
    //   C----D
    //
    //   A----------B
    // C---------D
    //
    // A--------B
    //   C---------D
    //
    //            A---------B  C-------D
    // C-------D  A---------B
    //return (as+aw >= bs && as+aw <= bs+bw) || (as >= bs && as <= bs+bw) || (as <= bs && as+aw >= bs+bw) || (as >= bs && as+aw <= bs+bw)
}

export const logcss = (log, color = 'red') => {
    console.log(`%c${log}`,`border:solid ${color} 2px`)
}

export const useRenders = (id, color = 'yellow')=>{
    const renders = useRef(0)
    renders.current += 1
    logcss(`==${renders.current}== id: ${id} `,color)
  }