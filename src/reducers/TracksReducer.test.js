import { tracksReducer } from "./TracksReducer";

test('move region to different track over existing region', ()=>{
   
    const action = {
        type:'update_region',
        updatedRegion: {regionId:'tr2r1', rOffset: 4.5, rDuration:6}, 
        jumpRelativeTracks: -1,
    }

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
                    // {regionId:'tr1r1',rOffset:1,rDuration:3},
                    // {regionId:'tr1r2',rOffset:5,rDuration:2},
                    // {regionId:'tr1r3',rOffset:10,rDuration:1},
                    
                    {regionId:'tr1r1',rOffset:1,rDuration:3}, {regionId:'tr2r1', rOffset: 4.5, rDuration:6}, {regionId:'tr1r3',rOffset:10.5,rDuration:0.5},
                ]
            },
            {
                trackId:'tr2',
                regions:[

                ]
            },
        ],
        contacts: [
            {region:{regionId:'tr1r2',rOffset:5,rDuration:2}, type:'overcast'},
            {region: {regionId:'tr1r3',rOffset:10,rDuration:1}, type:'overlap', side:'left'},
        ],
    }

    expect(tracksReducer(state,action)).toMatchObject(exp)
})