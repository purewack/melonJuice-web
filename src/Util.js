
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
    if((c >= a && c <= b && d >= b)) return {type:'overlap', side: 'left', dt:b-c}
    if((d <= b && d >= a && c <= a)) return {type:'overlap', side: 'right', dt:d-a}
    return null
}

export const logcss = (log, color = 'red') => {
    console.log(`%c${log}`,`border:solid ${color} 2px`)
}

export const useRenders = (id, color = 'yellow')=>{
    // const renders = useRef(0)
    // renders.current += 1
    // logcss(`==${renders.current}== id: ${id} `,color)
  }

export const simpleTest = ()=>{
    return 'i am tested'
}

export const generateSVGPathFromAudioBuffer = (tonebuffer, delays) =>{
    //this.useRenders('svg waveform gen')
    console.log('svg render')
    console.log(tonebuffer)

    if(!tonebuffer) return ''

    const sr = tonebuffer._buffer.sampleRate
    const samples = tonebuffer.getChannelData(0)
    const step = 256 //2048*1 //16384
    const offset = delays.start * sr
    const duration = samples.length - (delays.end*sr)
    let acc = 0
    let points = []
    let string = 'M 0,50 '
    for(let i = 0; i < duration; i++){
        const idx = Math.floor(i+offset < duration ? i+offset : duration-1)
        const s = samples[idx]
        acc += s*s
        if(i%step === 0){
            const rms = Math.sqrt(acc/step)
            const point = 50-(rms*100)
            acc = 0
            points.push(point)
            string += `L ${(i/duration)*100},${point} `  
        }
    }
    //string += 'L 100,50 L 0,50'
    for(let i = points.length-1; i>=0; i--){
        const pp = 100-points[i]
        const xx = i / (points.length-1)*100
        string += `L ${xx},${pp}`
    }
    //console.log(string)
    return string
}

export const randomColor = ()=>{
    const rand = ()=>{
      return Math.floor(Math.random()*40 + 195)
    }

    const cc = `rgb(${rand()},${rand()},${rand()})`
    return cc;
}