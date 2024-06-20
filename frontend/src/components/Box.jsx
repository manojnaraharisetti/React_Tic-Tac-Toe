import React from 'react'

export default function Box({ value, onClick, disabled }) {
  return (
    <div>
      <button className="box" onClick={onClick} disabled={disabled}>
      {value}
    </button>
    </div>
  )
}
