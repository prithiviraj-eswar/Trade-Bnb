import React from 'react'

const NoMatch = () => {
  return (
    <div
      className='error'
      style={{
        width: '100%',
        background: 'red',
        padding: '5px',
        display: 'inline-block',
        color: '#fff',
        textAlign: 'center',
        margin: '0.5rem',
      }}
    >
      NoMatch
    </div>
  )
}

export default NoMatch
