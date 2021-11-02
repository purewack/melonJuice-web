import {useState,useEffect} from 'react'

const TimelineBar = ({bar, number}) => {
    return(<div 
        className='TimelineBar'
        style={{width:bar}}>
        {1+ number}
    </div>)
}

export default TimelineBar