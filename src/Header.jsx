import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="bg-gray-800 shadow-md w-full fixed top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-2xl font-bold text-white"
              onClick={() => setIsOpen(false)}
            >
              RadjaShiqnals
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              {language === 'en' ? 'Home' : 'Beranda'}
            </Link>
            <Link
              to="/about-me"
              className="text-gray-300 px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-gray-700"
            >
              {language === 'en' ? 'About' : 'Tentang'}
            </Link>
            <Link
              to="/projects"
              className="text-gray-300 px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-gray-700"
            >
              {language === 'en' ? 'Projects' : 'Proyek'}
            </Link>
            <button
              onClick={toggleLanguage}
              className="text-gray-300 px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-gray-700"
            >
              {language === 'en' ? 'ID' : 'EN'}
            </button>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              {language === 'en' ? 'Home' : 'Beranda'}
            </Link>
            <Link
              to="/about-me"
              className="block text-gray-300 px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              {language === 'en' ? 'About' : 'Tentang'}
            </Link>
            <Link
              to="/projects"
              className="block text-gray-300 px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              {language === 'en' ? 'Projects' : 'Proyek'}
            </Link>
            <button
              onClick={() => {
                toggleLanguage();
                setIsOpen(false);
              }}
              className="block text-gray-300 px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-gray-700"
            >
              {language === 'en' ? 'ID' : 'EN'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;