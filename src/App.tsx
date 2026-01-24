import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Homepage from './components/Homepage';
import AboutMe from './components/AboutMe';
import ProjectList from './components/ProjectList';
import portfolioData from './data/data.json';
import './App.css';

type ViewType = 'home' | 'about' | 'projects';

function AppContent() {
  const [activeView, setActiveView] = useState<ViewType>('home');

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <Homepage
            fullName={portfolioData.profile.fullName}
            title={portfolioData.profile.title}
            bio={portfolioData.profile.bio}
          />
        );
      case 'about':
        return (
          <AboutMe
            introduction={portfolioData.about.introduction}
            experience={portfolioData.about.experience}
            specializations={portfolioData.about.specializations}
            currentFocus={portfolioData.about.currentFocus}
            location={portfolioData.profile.location}
            age={portfolioData.profile.age}
            education={portfolioData.profile.education}
          />
        );
      case 'projects':
        return <ProjectList projects={portfolioData.projects} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        profileImage={portfolioData.profile.image}
        name={portfolioData.profile.name}
        title={portfolioData.profile.title}
        socialMedia={portfolioData.socialMedia}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view as ViewType)}
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
