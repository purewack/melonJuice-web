import { useRef } from "react"


export const contactType = (a,b, c,d) => {
    
    //overlap right
    //   A----------B <Main
    // C---------D

    //overlap left
    // A--------B     <Main
    //   C---------D

    //overcast
    // A--------B     <Main
    //   C----D

    //contained
    //   A-----B      <Main
    // C---------D

    if((a <= c && b >= d)) return {type:'overcast'}
    if((a > c && b < d)) return {type:'contains', left:a-c, right:d-b}
    if((c > a && c < b && d > b)) return {type:'overlap', side: 'left', dt:b-c}
    if((d < b && d > a && c < a)) return {type:'overlap', side: 'right', dt:d-a}
    return null
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