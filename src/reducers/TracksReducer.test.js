import { tracksReducer } from "./TracksReducer";

test('move region to different track over existing region', ()=>{
   
    const action = {
        type:'update_region',
        updatedRegion: {regionId:'tr2r1', rOffset: 4.5, rDuration:6}, 
        jumpRelativeTracks: -1,
    }

    const state = {
        historyPointer: 0,
        history: [],
        current:
        [
            {
                trackId:'tr1',
                regions:[
                    {regionId:'tr1r1',rOffset:1,rDuration:4},
                    {regionId:'tr1r2',rOffset:5,rDuration:2},
                    {regionId:'tr1r3',rOffset:10,rDuration:1},
                ]
            },
            {
                trackId:'tr2',
                regions:[
                    {regionId:'tr2r1',rOffset:0,rDuration:6},
                ]
            },
        ]
    }

    const exp = {
        current: [
            {
                trackId:'tr1',
                regions:[
                    {regionId:'tr1r1',rOffset:1,rDuration:3.5}, 
                    {regionId:'tr2r1', rOffset: 4.5, rDuration:6}, 
                    {regionId:'tr1r3',rOffset:10.5,rDuration:0.5},
                ]
            },
            {
                trackId:'tr2',
                regions:[

                ]
            },
        ],
        contacts: [
            {region: {regionId:'tr1r1',rOffset:1,rDuration:4}, type:'overlap', side:'right'},
            {region: {regionId:'tr1r2',rOffset:5,rDuration:2}, type:'overcast'},
            {region: {regionId:'tr1r3',rOffset:10,rDuration:1}, type:'overlap', side:'left'},
        ],
    }

    expect(tracksReducer(state,action)).toMatchObject(exp)
})


test('move region to different track into an existing region forcing a split and insert', ()=>{
   
    const action = {
        type:'update_region',
        updatedRegion: {regionId:'tr2r1', rOffset: 3, rDuration:2}, 
        jumpRelativeTracks: -1,
    }

    const state = {
        historyPointer: 0,
        history: [],
        current:
        [
            {
                trackId:'tr1',
                regions:[
                    {regionId:'tr1r1',rOffset:1,rDuration:10},
                    {regionId:'tr1r2',rOffset:11,rDuration:2},
                ]
            },
            {
                trackId:'tr2',
                regions:[
                    {regionId:'tr2r1',rOffset:0,rDuration:1},
                ]
            },
        ]
    }

    const exp = {
        current: [
            {
                trackId:'tr1',
                regions:[
                    {rOffset:1, rDuration:2}, 
                    {regionId:'tr2r1', rOffset:3, rDuration:2}, 
                    {rOffset:5, rDuration:6},
                    {regionId:'tr1r2',rOffset:11,rDuration:2},
                ]
            },
            {
                trackId:'tr2',
                regions:[

                ]
            },
        ],
        contacts: [
            {region: {regionId:'tr1r1',rOffset:1,rDuration:10}, type:'contains', left:2, right:6},
        ],
    }

    expect(tracksReducer(state,action)).toMatchObject(exp)
})

