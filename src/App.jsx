import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Home from './pages/Home';
import Projects from './pages/Projects';
import About from './pages/About';
import ProjectDetail from './pages/ProjectDetail';
import AnimatedPage from './components/AnimatedPage';

function App() {
  const location = useLocation();
  const [selectedTag, setSelectedTag] = useState(null);

  return (
    <Layout selectedTag={selectedTag} setSelectedTag={setSelectedTag}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
          <Route path="/projects" element={<AnimatedPage><Projects selectedTag={selectedTag} /></AnimatedPage>} />
          <Route path="/projects/:id" element={<AnimatedPage><ProjectDetail /></AnimatedPage>} />
          <Route path="/about" element={<AnimatedPage><About /></AnimatedPage>} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default App;