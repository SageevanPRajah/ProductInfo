import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaHome, FaShoppingCart, FaInfoCircle, FaUserCircle } from 'react-icons/fa';
import { AiOutlineBell } from 'react-icons/ai';
import { BsRobot, BsBox, BsGraphUpArrow, BsGraphDownArrow, BsBank2, BsCreditCard2BackFill, BsCashCoin, BsPercent, BsArrowLeftCircle, BsArrowRightCircle } from 'react-icons/bs';

const Dashboard = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className='h-screen flex flex-col w-full'>
      {/* Header */}
      <header className='bg-[#001439] text-white py-6 px-10 text-3xl font-bold flex justify-between items-center shadow-md w-full'>
      <Link to='/'>
  <img 
    src='/public/logo.png' 
    alt='Logo' 
    className={`${isCollapsed ? 'w-[70%]' : 'w-[50%]'} h-auto mx-auto rounded-full transition-all duration-300 -ml-4`} 
  />
</Link>

<h4 className="text-left mt-4">All Templates</h4>



        <Link to='/'>
          <img 
            src='/public/Logo Circle.png' 
            alt='Logo' 
            className={`${isCollapsed ? 'w-[85%]' : 'w-[85%]'} h-auto mx-auto rounded-full transition-all duration-300 -ml-4`} 
          />
        </Link>
      </header>

      <div className='flex flex-1 w-full'>
        {/* Sidebar (Collapsible) */}
        <aside className={`bg-[#001439] text-white p-5 flex flex-col justify-between shadow-lg transition-all ${isCollapsed ? 'w-20' : 'w-[16%]'}`}>
          {/* Collapse Button */}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className='text-white mb-4 self-center'>
            {isCollapsed ? <BsArrowRightCircle className='w-6 h-6' /> : <BsArrowLeftCircle className='w-6 h-6' />}
          </button>
          
          {/* Navigation Links */}
          <nav className='flex flex-col gap-3 w-full'>
            <Link 
              to='/product' 
              className='p-3 bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-300 text-center flex items-center justify-center gap-4 rounded-lg border border-green-700 shadow-md shadow-green-700/30'
            >
              <FaHome className="w-6 h-6" /> {!isCollapsed && 'Home'}
            </Link>
            <Link 
              to='/income' 
              className='p-3 bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-300 text-center flex items-center justify-center gap-4 rounded-lg border border-green-700 shadow-md shadow-green-700/30'
            >
              <FaShoppingCart className="w-6 h-6" /> {!isCollapsed && 'Products'}
            </Link>
            <Link 
              to='/expenses' 
              className='p-3 bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-300 text-center flex items-center justify-center gap-4 rounded-lg border border-green-700 shadow-md shadow-green-700/30'
            >
              <FaInfoCircle className="w-6 h-6" /> {!isCollapsed && 'About'}
            </Link>
          </nav>

          {/* Footer Section */}
          <div className={`flex items-center p-3 gap-4 rounded-lg ${isCollapsed ? 'justify-center' : ''}`}>
          {isAuthenticated ? (
            <Link to='/profile'>
              <img
                src={user?.profilePicture || '/public/default-profile.png'}
                alt='Profile'
                className='w-8 h-8 rounded-full cursor-pointer'
              />
            </Link>
          ) : (
            <Link to='/login'>
              <img
                src='/public/default-profile.png'
                alt='Login'
                className='w-8 h-8 rounded-full cursor-pointer'
              />
            </Link>
          )}
            {!isCollapsed && (
              <div className='flex flex-col'>
                <p className="text-sm font-semibold">Admin</p>
                <p className="text-xs text-gray-400">Example@gmail.com</p>

                
              </div>
            )}
          </div>
        </aside>
        
        {/* Content */}
        <main className='w-[84%] p-6 bg-gray-100 flex-1 overflow-y-auto bg-cover bg-center'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
