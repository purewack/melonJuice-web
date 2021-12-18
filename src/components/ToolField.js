import React from 'react'
import '../css/Fields.css'

export default function ToolField({children}) {
    return (<div className='ToolField'
        style={{width:50}}
    >
        {children}
    </div>)
}
