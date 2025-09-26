import React, { useState } from 'react';
import { motion } from 'framer-motion';
import profileData from '../data/profile.json';
import projectsData from '../data/projects.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faYoutube, faGithub } from '@fortawesome/free-brands-svg-icons';

const Sidebar = ({ setSelectedTag, selectedTag }) => {
  const [showAllTags, setShowAllTags] = useState(false);

  // Calculate tag counts
  const tagCounts = projectsData.flatMap(p => p.tags).reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});

  const sortedTags = Object.keys(tagCounts).sort((a, b) => a.localeCompare(b));

  const visibleTags = showAllTags ? sortedTags : sortedTags.slice(0, 4);

  return (
    <aside className="bg-transparent text-white w-full md:w-80 p-4 flex flex-col items-center flex-shrink-0">
      {/* Profile Card */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 w-full flex flex-col items-center mb-8">
        <img src={profileData.profile_picture} alt={profileData.profile_name} className="rounded-full h-36 w-36 mb-4" />
        <h2 className="text-xl font-bold">{profileData.profile_name}</h2>
        <p className="text-slate-400">{profileData.nickname}</p>
        <p className="text-sm text-center my-4">{profileData.description}</p>
        <div className="flex space-x-6">
          <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><FontAwesomeIcon icon={faLinkedin} size="2x" /></a>
          <a href={profileData.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><FontAwesomeIcon icon={faYoutube} size="2x" /></a>
          <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><FontAwesomeIcon icon={faGithub} size="2x" /></a>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 w-full flex flex-col">
        <h3 className="text-lg font-bold mb-4 text-center">Filter by Tag</h3>
        <div className="flex flex-col gap-2 items-start w-full">
          <button onClick={() => setSelectedTag(null)} className={`w-full text-left p-2 rounded-md transition-colors flex justify-between ${!selectedTag ? 'bg-blue-500/30 text-white' : 'hover:bg-slate-700'}`}>
            <span>All</span>
            <span>({projectsData.length})</span>
          </button>
          {visibleTags.map(tag => (
            <button key={tag} onClick={() => setSelectedTag(tag)} className={`w-full text-left p-2 rounded-md transition-colors flex justify-between ${selectedTag === tag ? 'bg-blue-500/30 text-white' : 'hover:bg-slate-700'}`}>
              <span>{tag}</span>
              <span>({tagCounts[tag]})</span>
            </button>
          ))}
        </div>
        {sortedTags.length > 4 && (
          <button onClick={() => setShowAllTags(!showAllTags)} className="text-blue-400 hover:underline mt-4 text-sm self-center">
            {showAllTags ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;