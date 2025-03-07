import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const MainLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen relative bg-gray-50">
      {/* Toggle Button - Moved slightly higher */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-all duration-300`}
      >
        <div className="w-6 h-6 relative">
          <span className={`absolute left-0 top-[5px] w-6 h-[2px] bg-white transform transition-all duration-300 ${
            isOpen ? 'rotate-45 translate-y-[7px]' : ''
          }`} />
          <span className={`absolute left-0 top-[12px] w-6 h-[2px] bg-white transition-opacity duration-300 ${
            isOpen ? 'opacity-0' : ''
          }`} />
          <span className={`absolute left-0 top-[19px] w-6 h-[2px] bg-white transform transition-all duration-300 ${
            isOpen ? '-rotate-45 -translate-y-[7px]' : ''
          }`} />
        </div>
      </button>

      {/* Dark Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50 z-30' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 w-64 bg-gray-900 text-white h-screen flex flex-col justify-between px-6 py-8 transform transition-transform duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="flex flex-col space-y-4 mt-12">
          <NavLink 
            to="/#home" 
            className={({ isActive }) => 
              `px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink 
            to="/#projects" 
            className={({ isActive }) => 
              `px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'
              }`
            }
          >
            Projects
          </NavLink>
          <NavLink 
            to="/#about" 
            className={({ isActive }) => 
              `px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'
              }`
            }
          >
            About
          </NavLink>
        </nav>
        <div className="flex flex-col space-y-4">
          <NavLink 
            to="/#settings" 
            className={({ isActive }) => 
              `px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'
              }`
            }
          >
            Settings
          </NavLink>
          <div className="text-sm text-gray-500">
            © {year} RadjaShiqnals
          </div>
        </div>
      </aside>

      {/* Main Content - Added padding-top to clear the hamburger */}
      <main className="w-full min-h-screen pt-16 px-6 sm:px-8 md:px-12">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
