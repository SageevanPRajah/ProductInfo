import React from 'react';
import Dashboard from '../components/Dashboard';
import { AiOutlineSearch } from 'react-icons/ai'; // Search icon
import { BsPlus } from 'react-icons/bs'; // Plus icon for the button

const Home = () => {
  return (
    <Dashboard>
      <div className="bg-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search"
            />
          </div>

          {/* Dropdown and Add New Template Button */}
          <div className="flex items-center gap-4">
            {/* Dropdown List */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 text-gray-600 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Sort by"
                defaultValue=""
              >
                <option value="" >
                  Sort by
                </option>
                <option value="latest">Latest</option>
                <option value="popular">Popular</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
              </select>
              {/* Dropdown Arrow Icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Add New Template Button */}
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all"
              aria-label="Add new Template"
              onClick={() => {
                // Handle button click
                console.log("Add new Template clicked");
              }}
            >
              <BsPlus className="w-5 h-5" />
              <span>Add new Template</span>
            </button>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

export default Home;