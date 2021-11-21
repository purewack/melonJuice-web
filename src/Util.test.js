import { contactType } from "./Util";

// test('prints out simple test res', ()=>{
//     expect(simpleTest()).toBe('i am tested')
// })

// test('overlap true check', ()=>{
//     expect(isOverlapping(10,20, 19,30)).toBe(true)
// })
// test('overlap false check', ()=>{
//     expect(isOverlapping(10,20, 21,30)).toBe(false)
// })

// test('overcast true check', ()=>{
//     expect(isOvercasting(10,30, 11,19)).toBe(true)
// })
// test('overcast false check', ()=>{
//     expect(isOvercasting(11,19, 10,30)).toBe(false)
// })

// test('contained true check', ()=>{
//     expect(isContained(11,19, 5,30)).toBe(true)
// })
// test('contained false check', ()=>{
//     expect(isContained(1,40, 5,30)).toBe(false)
// })

test('no contact R1 R2', ()=>{
    expect(contactType(10,20, 40,50)).toBeNull()
})

test('R1 overlaps R2', ()=>{
    expect(contactType(20,30, 25,50)).toMatchObject({type:'overlap', side:'left', dt:5})
})

test('R2 overlaps R1', ()=>{
    expect(contactType(38,60, 25,50)).toMatchObject({type:'overlap', side:'right', dt:12})
})

test('R1 inside R2', ()=>{
    expect(contactType(10,20, 0,50)).toMatchObject({type:'contains'})
})
test('R1 overcast R2', ()=>{
    expect(contactType(10,60, 40,50)).toMatchObject({type:'overcast'})
})