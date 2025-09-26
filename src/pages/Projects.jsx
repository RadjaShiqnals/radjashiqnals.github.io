import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import projectsData from '../data/projects.json';

const Projects = ({ selectedTag }) => {
  const [filteredProjects, setFilteredProjects] = useState(projectsData);

  useEffect(() => {
    if (selectedTag) {
      setFilteredProjects(projectsData.filter(p => p.tags.includes(selectedTag)));
    } else {
      setFilteredProjects(projectsData);
    }
  }, [selectedTag]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Projects</h1>
      <div className="flex flex-col gap-8">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-6 flex flex-col md:flex-row gap-6">
            <img src={project.thumbnails[0]} alt={project.project_name} className="rounded-lg w-full md:w-1/3 object-cover" />
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold mb-2">{project.project_name}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map(tag => (
                  <span key={tag} className="bg-slate-700 text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
              <p className="text-slate-400 mb-4 flex-grow">{project.project_description}</p>
              <div className="flex justify-between items-center mt-auto">
                <Link to={`/projects/${project.id}`} className="text-blue-400 hover:underline">Read more...</Link>
                <span className="text-xs text-slate-500">Last updated: {new Date(project.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
