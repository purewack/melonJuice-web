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