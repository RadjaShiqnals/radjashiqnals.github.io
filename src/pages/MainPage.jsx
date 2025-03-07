import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './MainPage.module.css';

/**
 * MainPage Component
 * Handles the main content area with multiple sections that change based on URL hash
 * Uses hash-based routing to switch between different content sections
 */
const MainPage = () => {
  // Get current URL location and manage active section state
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('home');

  // Define valid routes to check against
  const validRoutes = ['home', 'projects', 'about', 'settings'];

  // Effect to handle section changes based on URL hash
  useEffect(() => {
    const section = location.hash ? location.hash.replace('#', '') : 'home';
    if (validRoutes.includes(section)) {
      setActiveSection(section);
    } else {
      setActiveSection('not-found');
    }
  }, [location]);

  return (
    <div className="relative min-h-screen max-w-7xl mx-auto">
      <section 
        id="home" 
        className={`absolute w-full section-enter ${activeSection === 'home' ? 'section-enter-active' : 'hidden'}`}
      >
        <h1 className="text-4xl font-bold mb-6">Welcome to My Portfolio</h1>
        <p className="text-lg text-gray-600">Here you'll find information about my work and experience.</p>
      </section>

      <section 
        id="projects" 
        className={`absolute w-full section-enter ${activeSection === 'projects' ? 'section-enter-active' : 'hidden'}`}
      >
        <h1 className="text-4xl font-bold mb-4">My Projects</h1>
        <p className="text-lg text-gray-600">Here are some of the projects I've worked on.</p>
      </section>

      <section 
        id="about" 
        className={`absolute w-full section-enter ${activeSection === 'about' ? 'section-enter-active' : 'hidden'}`}
      >
        <h1 className="text-4xl font-bold mb-4">About Me</h1>
        <p className="text-lg text-gray-600">Learn more about my background and experience.</p>
      </section>

      <section 
        id="settings" 
        className={`absolute w-full section-enter ${activeSection === 'settings' ? 'section-enter-active' : 'hidden'}`}
      >
        <h1 className="text-4xl font-bold mb-4">Settings</h1>
        <p className="text-lg text-gray-600">Configure your preferences here.</p>
      </section>

      <section 
        id="not-found" 
        className={`absolute w-full text-center pt-16 section-enter ${activeSection === 'not-found' ? 'section-enter-active' : 'hidden'}`}
      >
        <h1 className="text-4xl font-bold text-red-500 mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-gray-600">The page you're looking for doesn't exist.</p>
      </section>
    </div>
  );
};

export default MainPage;
