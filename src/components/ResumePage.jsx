import React, { useEffect } from 'react'

function ResumePage() {
  useEffect(() => {
    // Trigger download immediately when the page loads
    const link = document.createElement('a')
    link.href = '/Yohan_Berg_Resume_October-2.pdf'
    link.download = 'Yohan_Berg_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  return (
    <div className="app" style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>Downloading Resume...</h1>
      <p>Your download should start automatically.</p>
    </div>
  )
}

export default ResumePage

