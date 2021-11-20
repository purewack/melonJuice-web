import { simpleTest,isContained, isOvercasting, isOverlapping } from "./Util";

test('prints out simple test res', ()=>{
    expect(simpleTest()).toBe('i am tested')
})

test('overlap true check', ()=>{
    expect(isOverlapping(10,20, 19,30)).toBe(true)
})
test('overlap false check', ()=>{
    expect(isOverlapping(10,20, 21,30)).toBe(false)
})

test('overcast true check', ()=>{
    expect(isOvercasting(10,30, 11,19)).toBe(true)
})
test('overcast false check', ()=>{
    expect(isOvercasting(11,19, 10,30)).toBe(false)
})

test('contained true check', ()=>{
    expect(isContained(11,19, 5,30)).toBe(true)
})
test('contained false check', ()=>{
    expect(isContained(1,40, 5,30)).toBe(false)
})