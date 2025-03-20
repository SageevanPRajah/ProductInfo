import React from 'react'
import {Routes, Route} from 'react-router-dom'

//Common

//Auth
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Profile from './pages/auth/Profile.jsx';
import AuthSuccess from './pages/auth/AuthSuccess.jsx';

const App = () => {
  return (
    <Routes>
      
      {/** Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/auth-success" element={<AuthSuccess />} />
      
    </Routes>
  )
}

export default App
