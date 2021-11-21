import { tracksReducer } from "./TracksReducer";

test('change tracks region delete from source and overcast check', ()=>{
    const state = {current:
        [
            {
                trackId:'tr1',
                regions:[
                    {regionId:'tr1r1',rOffset:1,rDuration:3},
                    {regionId:'tr1r2',rOffset:5,rDuration:2},
                    {regionId:'tr1r3',rOffset:10,rDuration:1},
                ]
            },
            {
                trackId:'tr2',
                regions:[
                    {regionId:'tr2r1',rOffset:0,rDuration:5},
                ]
            },
        ]
    }

    const action = {
        type:'update_region',
        updatedRegion: {regionId:'tr2r1', rOffset: 4.1, rDuration:5}, 
        jumpRelativeTracks: -1,
    }
    const exp = {
        current: [
            {
                trackId:'tr1',
                regions:[
                    {regionId:'tr1r1',rOffset:1,rDuration:3},
                    {regionId:'tr1r2',rOffset:5,rDuration:2},
                    {regionId:'tr1r3',rOffset:10,rDuration:1},
                    
                    //{regionId:'tr1r1',rOffset:1,rDuration:3}, {regionId:'tr2r1', rOffset: 4.1, rDuration:5}, {regionId:'tr1r3',rOffset:10,rDuration:1},
                ]
            },
            {
                trackId:'tr2',
                regions:[

                ]
            },
        ],
        contacts: [
            {regionId:'tr1r2', type:'overcast'},
        ]
    }

    expect(tracksReducer(state,action)).toMatchObject(exp)
})