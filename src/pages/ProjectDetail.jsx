import React from 'react';
import { useParams } from 'react-router-dom';
import projectsData from '../data/projects.json';

const ProjectDetail = () => {
  const { id } = useParams();
  const project = projectsData.find((p) => p.id === parseInt(id));

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{project.project_name}</h1>
      <p className="text-slate-400 mb-4">{project.project_description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project.thumbnails.map((thumbnail, index) => (
          <img key={index} src={thumbnail} alt={`${project.project_name} thumbnail ${index + 1}`} className="rounded-md" />
        ))}
      </div>
      <a href={project.project_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mt-4 inline-block">View Project</a>
    </div>
  );
};

export default ProjectDetail;
