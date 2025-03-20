import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AiOutlineBell } from 'react-icons/ai';
import { BsRobot, BsBox, BsGraphUpArrow, BsGraphDownArrow, BsBank2, BsCreditCard2BackFill, BsCashCoin, BsPercent, BsArrowLeftCircle, BsArrowRightCircle } from 'react-icons/bs';

const Dashboard = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className='h-screen flex flex-col w-full'>
      {/* Header */}
      <header className='bg-blue-900 text-white py-4 px-8 text-2xl font-bold flex justify-between items-center shadow-md w-full'>
        <div className='flex items-center gap-6'>
          <span className='text-3xl font-extrabold tracking-wide'>TaxMate</span>
        </div>
        <nav className='flex gap-6 items-center'>
          <Link to='/chat' className='hover:underline'>
            <BsRobot className='w-8 h-8' />
          </Link>
          <Link to='/income' className='hover:underline'>
            <AiOutlineBell className='w-8 h-8' />
          </Link>
          {isAuthenticated ? (
            <Link to='/profile'>
              <img
                src={user?.profilePicture || '/public/default-profile.png'}
                alt='Profile'
                className='w-10 h-10 rounded-full cursor-pointer'
              />
            </Link>
          ) : (
            <Link to='/login'>
              <img
                src='/public/default-profile.png'
                alt='Login'
                className='w-10 h-10 rounded-full cursor-pointer'
              />
            </Link>
          )}
        </nav>
      </header>
      
      <div className='flex flex-1 w-full'>
        {/* Sidebar (Collapsible) */}
        <aside className={`bg-blue-800 text-white p-5 flex flex-col gap-4 shadow-lg items-center transition-all ${isCollapsed ? 'w-20' : 'w-[16%]'}`}>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className='text-white mb-4'>
            {isCollapsed ? <BsArrowRightCircle className='w-6 h-6' /> : <BsArrowLeftCircle className='w-6 h-6' />}
          </button>
          <Link to='/'>
            <img src='/public/logo.png' alt='Logo' className={`${isCollapsed ? 'w-[70%]' : 'w-[50%]'} h-auto mx-auto rounded-full transition-all duration-300`} />
          </Link>
          <nav className='flex flex-col gap-3 w-full'>
            <Link to='/product' className='p-3 border-2 border-orange-600 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 shadow-md shadow-orange-700/30 hover:shadow-orange-700/70 hover:scale-105 transition-all duration-300 text-center flex items-center justify-center gap-4'>
              <BsBox className="w-6 h-6" /> {!isCollapsed && 'Product'}
            </Link>
            <Link to='/income' className='p-3 border-2 border-orange-600 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 shadow-md shadow-orange-700/30 hover:shadow-orange-700/70 hover:scale-105 transition-all duration-300 text-center flex items-center justify-center gap-4'>
              <BsGraphUpArrow className="w-6 h-6" /> {!isCollapsed && 'Income'}
            </Link>
            <Link to='/expenses' className='p-3 border-2 border-orange-600 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 shadow-md shadow-orange-700/30 hover:shadow-orange-700/70 hover:scale-105 transition-all duration-300 text-center flex items-center justify-center gap-4'>
              <BsGraphDownArrow className="w-6 h-6" /> {!isCollapsed && 'Expenses'}
            </Link>
            <Link to='/' className='p-3 border-2 border-orange-600 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 shadow-md shadow-orange-700/30 hover:shadow-orange-700/70 hover:scale-105 transition-all duration-300 text-center flex items-center justify-center gap-4'>
              <BsBank2 className="w-6 h-6" /> {!isCollapsed && 'Assets'}
            </Link>
            <Link to='/' className='p-3 border-2 border-orange-600 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 shadow-md shadow-orange-700/30 hover:shadow-orange-700/70 hover:scale-105 transition-all duration-300 text-center flex items-center justify-center gap-4'>
              <BsCreditCard2BackFill className="w-6 h-6" /> {!isCollapsed && 'Liabilities'}
            </Link>
            <Link to='/' className='p-3 border-2 border-orange-600 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 shadow-md shadow-orange-700/30 hover:shadow-orange-700/70 hover:scale-105 transition-all duration-300 text-center flex items-center justify-center gap-4'>
              <BsCashCoin className="w-6 h-6" /> {!isCollapsed && 'Tax Payment'}
            </Link>
            <Link to='/' className='p-3 border-2 border-orange-600 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 shadow-md shadow-orange-700/30 hover:shadow-orange-700/70 hover:scale-105 transition-all duration-300 text-center flex items-center justify-center gap-4'>
              <BsPercent className="w-6 h-6" /> {!isCollapsed && 'Tax Rate'}
            </Link>
          </nav>
        </aside>


        {/* Content */}
        <main className='w-[84%] p-6 bg-gray-100 flex-1 overflow-y-auto bg-cover bg-center' style={{ backgroundImage: "url('/backrd4.png')" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
