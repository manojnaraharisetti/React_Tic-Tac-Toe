import React from 'react'

export default function Message({ message, onNewGame }) {
  return (
    <div>
       <div className={`msg-container ${message ? "" : "hide"}`}>
      <p>{message}</p>
      {/* <button onClick={onNewGame} id="reset-btn">New Game</button> */}
    </div>
    </div>
  )
}
