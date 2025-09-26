import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white">Home</Link>
      <Link to="/projects" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white">Projects</Link>
      <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white">About</Link>
    </>
  );

  return (
    <header className="bg-slate-800/50 backdrop-blur-lg text-white p-4 flex justify-between items-center z-20 sticky top-0">
      <h1 className="text-xl font-bold">My Portfolio</h1>
      
      {/* Desktop Nav */}
      <nav className="hidden md:flex gap-2">
        {navLinks}
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button onClick={() => setMenuOpen(!isMenuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-full left-0 w-full bg-slate-800/80 backdrop-blur-lg md:hidden flex flex-col items-center gap-2 p-4"
          >
            {navLinks}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
