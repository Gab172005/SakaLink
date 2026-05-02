import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import './styles/global.css'
import MarketplacePage from './components/MarketplacePage'

function App() {
  return (
    <div className="app-container">
      <Toaster position="top-center" reverseOrder={false} />
      <main>
        <Routes>
          <Route path="/browse" element={<MarketplacePage />} />
          <Route path="*" element={<div style={{ padding: '2rem' }}>Page Not Found</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App