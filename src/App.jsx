import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import AboutMe from './AboutMe';
import Projects from './Projects';
import Footer from './Footer';
import LoadingSpinner from './LoadingSpinner';
import { LanguageProvider } from './LanguageContext';

function App() {
  const [loading, setLoading] = useState(true);
  const [showCloseButton, setShowCloseButton] = useState(false);

  useEffect(() => {
    const rainContainer = document.querySelector('.rain');
    const numDrops = 50;

    for (let i = 0; i < numDrops; i++) {
      const drop = document.createElement('div');
      drop.className = 'raindrop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${1 + Math.random() * 2}s`;
      rainContainer.appendChild(drop);
    }

    // Simulate loading time
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000); // Adjust the timeout as needed

    // Show close button after 5 seconds
    const closeButtonTimeout = setTimeout(() => {
      setShowCloseButton(true);
    }, 5000);

    return () => {
      clearTimeout(loadingTimeout);
      clearTimeout(closeButtonTimeout);
    };
  }, []);

  return (
    <LanguageProvider>
      {loading && <LoadingSpinner showCloseButton={showCloseButton} onClose={() => setLoading(false)} />}
      <Router>
        <Header />
        <div className="background-rain">
          <div className="rain"></div>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-me" element={<AboutMe />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
        <Footer />
      </Router>
    </LanguageProvider>
  );
}

export default App;