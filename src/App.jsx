import React from 'react'
import { Routes, Route } from 'react-router-dom'
import BalloonMapContainer from './components/BalloonMapContainer'
import ResumePage from './components/ResumePage'
import './App.css'

function HomePage() {
  return (
    <>
      <h1>Windborne Balloons on Google Maps!</h1>
      <BalloonMapContainer />
      <div className="resume-section">
        <p className="resume-text">
          Take a look at my{' '}
          <a href="/resume" className="resume-link">
            resume
          </a>
          ! ;)
          <br />
          - Yohan Berg
        </p>
      </div>
      <footer className="attribution">
        <a 
          href="https://www.flaticon.com/free-icons/birthday" 
          title="birthday icons"
          target="_blank"
          rel="noopener noreferrer"
        >
          Birthday icons created by Pixel perfect - Flaticon
        </a>
      </footer>
    </>
  )
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resume" element={<ResumePage />} />
      </Routes>
    </div>
  )
}

export default App

