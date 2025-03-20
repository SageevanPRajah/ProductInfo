import React from 'react'
import {Routes, Route} from 'react-router-dom'

//Common
import Home from './pages/Home.jsx';


//Auth
import Login1 from './pages/auth/Login1.jsx';

import Register from './pages/auth/Register.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
     

      {/** Auth */}
      <Route path="/login" element={<Login1 />} />
      
      <Route path="/register" element={<Register />} />
      
      
      
    </Routes>
  )
}

export default App
