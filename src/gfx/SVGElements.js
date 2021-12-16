import React from 'react'

const SVGElements = ({width, height})=>{
    return (
        
    <svg xmlns="http://www.w3.org/2000/svg" style={{display:'none'}}>
    <defs>
      <symbol id="melonhandle" viewBox='0 0 100 100'>
        <circle cx="50" cy="50" r="45" stroke-width="10" stroke="#007a00" fill="#c24c4c"></circle>
        <ellipse transform="rotate(120 50 50) translate(15 0)" cx="50" cy="50" rx="10" ry="4" ></ellipse> 
        <ellipse transform="rotate(240 50 50) translate(15 0)" cx="50" cy="50" rx="10" ry="4" ></ellipse> 
        <ellipse transform="translate(15 0)" cx="50" cy="50" rx="10" ry="4" ></ellipse> 
      </symbol>
    </defs>
  </svg>

    )
}
export default React.memo(SVGElements)