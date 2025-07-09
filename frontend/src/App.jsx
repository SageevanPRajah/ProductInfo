import { React, useEffect } from 'react'
import {  Routes, Route } from 'react-router-dom'
import { useLocation } from "react-router-dom";
import { logActivity } from "./utils/logActivity";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Common
import Home from './pages/Home.jsx';
import AboutUs from './pages/common/AboutUs.jsx';
import AccessDenied from './pages/common/AccessDenied.jsx';

// Auth
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Profile from './pages/auth/Profile.jsx';
import IndexProfile from './pages/auth/IndexProfile.jsx'
import EditProfile from './pages/auth/EditProfile.jsx';
import AuthSuccess from './pages/auth/AuthSuccess.jsx';
import AddUser from './pages/auth/AddUser.jsx';
import AuthCallback from './pages/auth/AuthCallback.jsx';

// Templates
import ViewTemplate from './pages/templates/ViewTemplate.jsx';
import EditTemplate from './pages/templates/EditTemplate.jsx';
import ViewData from './pages/templateData/viewData.jsx';
import InspectData from './pages/templateData/InspectData.jsx';
import AllProduct from './pages/templateData/AllProduct.jsx';
import AllTemplateProduct from './pages/templateData/AllTemplateProduct.jsx';


// Log file
import LogViewer from './pages/logFile/LogViewer.jsx';

// Products
import AddProduct from './pages/products/AddProduct.jsx';
import EditProduct from './pages/products/EditProduct.jsx';

//backup
import AllDeleteProducts from './pages/backup/AllDeleteProducts.jsx';
import BackupData from './pages/backup/BackupData.jsx';

function App() {
  return (
    <Routes>
      {/* Public */}
      {/* Common Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutUs/>} />
      <Route path="/access-denied" element={<AccessDenied />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      {/* <Route path="/profile" element={<ProtectedRoute> <Profile /> </ProtectedRoute>} /> */}
      <Route path="/profileIndex" element={<IndexProfile />} />
      {/* <Route path="/profileIndex" element={<ProtectedRoute roles={['SuperAdmin']} > <IndexProfile /> </ProtectedRoute>} /> */}
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/auth-success" element={<AuthSuccess />} />
      <Route path="/profile/add" element={<AddUser />} />
      <Route path="/auth/azure/callback" element={<AuthCallback />} /> 

      {/* Template Routes */}
      <Route path="/templates/:id" element={<ViewTemplate />} />
      <Route path="/templates/:id/edit" element={<EditTemplate />} />
      <Route path="/templates/:id/add-product" element={<AddProduct />} />
      {/* <Route path="/templates/:id/add-product"  element={<ProtectedRoute roles={['Admin', 'SuperAdmin']} > <AddProduct /> </ProtectedRoute>} /> */}
      <Route path="/products" element={<AllProduct />} />
      <Route path="/products/:templateID" element={<AllTemplateProduct />} />
      
      {/* Template Data Routes */}
      <Route path="/viewData/:id" element={<ViewData />} />
      <Route path="/inspectData/:id" element={<InspectData />} />
      <Route path="/editProduct/:id" element={<EditProduct />} />

      {/* Log File Routes */}
      <Route path="/logFile" element={<LogViewer />} />

      {/* Backup File Routes */}
      <Route path="/backup" element={<AllDeleteProducts />} />
      <Route path="/backup/:id" element={<BackupData />} />
    </Routes>
  );
}

export default App;