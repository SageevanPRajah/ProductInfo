import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Placeholder functions for handling login
  const handleGoogleLogin = () => {
    alert("Google Login clicked!");
  };

  const handlefaceBookLogin = () => {
    alert("Facebook Login clicked!");
  };

  const handleLogin = () => {
    // Placeholder validation logic
    if (!email || !password) {
      setError('Please enter both email and password.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format.');
    } else if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
    } else {
      // Here you would typically call an API to validate credentials
      // For demonstration, just reset error and alert success
      setError(null);
      alert('Login successful!');
    }
  };

  return (
    <div
  className="w-screen h-screen flex flex-col"
  style={{
    backgroundImage: "url('/backrd4.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
<div className="h-screen flex items-center justify-center">
  <div className="w-[400px] p-5 rounded-lg bg-white shadow-md font-sans">
    {/* Logo */}
    <div className="flex justify-center mb-5">
  <img
    src="/logo.png" 
    alt="Logo"
    className="w-[200px] h-auto"
  />
</div>


    {/* Social Login Buttons */}
    <div className="flex justify-between mb-4">
      <button
        onClick={handleGoogleLogin}
        className="flex items-center justify-center w-[48%] p-2 rounded-lg border border-gray-300 bg-white text-black cursor-pointer shadow-sm whitespace-nowrap overflow-visible"
      >
        <FcGoogle className="w-5 h-5 mr-2" />
        <span className="text-xs">Login with Google</span>
      </button>
      <button
        onClick={handlefaceBookLogin}
        className="flex items-center justify-center w-[48%] p-2 rounded-lg border border-gray-300 bg-white text-black cursor-pointer shadow-sm whitespace-nowrap overflow-visible"
      >
        <FaFacebook className="w-5 h-5 mr-2" />
        <span className="text-xs">Login with Facebook</span>
      </button>
    </div>

    <p className="text-center text-gray-600 mb-4">OR</p>

    {/* Form */}
    <div className="mb-3">
      <label className="block text-xs mb-1">Email</label>
      <input
        type="email"
        placeholder="example@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 rounded border border-gray-300 text-xs"
      />
    </div>
    <div className="mb-3">
      <label className="block text-xs mb-1">Password</label>
      <div className="relative flex items-center">
        <input
          type={passwordVisible ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded border border-gray-300 text-xs"
        />
        <span
          className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-xs"
          onClick={togglePasswordVisibility}
        >
          {passwordVisible ? '\u25CF' : '\u25CB'}
        </span>
      </div>
      <a href="#" className="text-blue-500 text-xs text-right block mt-1">
        Forgot Password?
      </a>
    </div>

    <div className="flex items-center mb-3">
      <input type="checkbox" id="rememberMe" className="mr-1" />
      <label htmlFor="rememberMe" className="text-xs">
        Remember me
      </label>
    </div>

    {error && <p className="text-red-500 mb-3 text-xs">{error}</p>}

    <button
      onClick={handleLogin}
      className="w-full p-2 bg-blue-500 text-white rounded cursor-pointer"
    >
      Login
    </button>

    {/* Register Link */}
    <p className="text-center mt-3 text-xs">
      Don't have an account?{' '}
      <Link to="/register" className="text-blue-500">
        Register
      </Link>
    </p>
  </div>
</div>

    </div>
  );
};

export default Login;