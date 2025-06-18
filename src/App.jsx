import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LoginRegister from './pages/LoginRegister'
import Home from './pages/Home'
import OAuthCallback from './pages/OAuthCallback'
import ProfileSetupPage from './pages/ProfileSetupPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/auth' element={<LoginRegister />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/profile-setup" element={<ProfileSetupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App