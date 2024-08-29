import React, { useState } from "react";
import { Link } from "react-router-dom";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-gray-800 shadow-md w-full fixed top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-2xl font-bold text-white"
              onClick={() => setIsOpen(false)}
            >
              RadjaShiqnals
            </Link>
          </div>

          {/* Hamburger Menu for Mobile */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-900 text-gray-400 inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              Home
            </Link>
            <Link
              to="/about-me"
              className="text-gray-300 px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-gray-700"
            >
              About
            </Link>

            <Link
              to="/projects"
              className="text-gray-300 px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-gray-700"
            >
              Projects
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
            >
              Home
            </Link>
            <Link
              to="/about-me"
              className="block text-gray-300 px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-gray-700"
            >
              About
            </Link>
            <Link
              to="/projects"
              className="block text-gray-300 px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-gray-700"
            >
              Projects
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
