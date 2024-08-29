import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import AboutMe from './AboutMe';
import Projects from './Projects';
import Footer from './Footer';



function App() {
  useEffect(() => {
    const rainContainer = document.querySelector('.rain');
    const numDrops = 50; // Adjust the number of raindrops

    for (let i = 0; i < numDrops; i++) {
      const drop = document.createElement('div');
      drop.className = 'raindrop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${1 + Math.random() * 2}s`; // Adjust animation duration
      rainContainer.appendChild(drop);
    }
  }, []);

  return (
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
      <Footer /> {/* Add the Footer component */}
    </Router>
  );
}

export default App;