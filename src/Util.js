import { useRef } from "react"

export const isOverlapping = (a,b, c,d) => {
    //console.log({a,b,c,d})
    return (d < b && d > a && c < a) || (c > a && c < b && d > b)

    //   A----------B
    // C---------D
    //
    // A--------B
    //   C---------D

}

export const isOvercasting = (a,b, c,d) => {
    //console.log({a,b,c,d})
    return (a <= c && b >= d)

    // A--------B
    //   C----D
}

export const isContained = (a,b, c,d) => {
    //console.log({a,b,c,d})
    return (a > c && b < d)

    //   A-----B
    // C---------D
}

export const logcss = (log, color = 'red') => {
    console.log(`%c${log}`,`border:solid ${color} 2px`)
}

export const useRenders = (id, color = 'yellow')=>{
    const renders = useRef(0)
    renders.current += 1
    logcss(`==${renders.current}== id: ${id} `,color)
  }

export const simpleTest = ()=>{
    return 'i am tested'
}