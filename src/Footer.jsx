// Footer.jsx
import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 w-full bottom-0 left-0 sticky">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Radja Genta Saputra. All rights reserved.
        </p>
        <div className="mt-2">
          <a href="https://github.com/RadjaShiqnals" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white mx-2">GitHub</a>
          <a href="mailto:radjagentasaputra@gmail.com" className="text-gray-400 hover:text-white mx-2">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

