"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { faGithub as faGithubBrand } from "@fortawesome/free-brands-svg-icons";

interface Project {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  images: string[];
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "E-commerce Platform",
    description:
      "A full-stack e-commerce platform built with Next.js and Stripe integration. Features include user authentication, product management, shopping cart, and secure payments.",
    thumbnail:
      "https://placehold.co/400x300/6366f1/ffffff?text=E-commerce+Platform",
    images: [
      "https://placehold.co/800x600/6366f1/ffffff?text=E-commerce+Homepage",
      "https://placehold.co/800x600/8b5cf6/ffffff?text=Product+Page",
      "https://placehold.co/800x600/06b6d4/ffffff?text=Shopping+Cart",
      "https://placehold.co/800x600/10b981/ffffff?text=Checkout+Process",
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Stripe",
      "PostgreSQL",
    ],
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: 2,
    title: "Task Management App",
    description:
      "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
    thumbnail: "https://placehold.co/400x300/10b981/ffffff?text=Task+Manager",
    images: [
      "https://placehold.co/800x600/10b981/ffffff?text=Dashboard+View",
      "https://placehold.co/800x600/f59e0b/ffffff?text=Kanban+Board",
      "https://placehold.co/800x600/ef4444/ffffff?text=Team+Collaboration",
    ],
    technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Express"],
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: 3,
    title: "Weather Dashboard",
    description:
      "A responsive weather dashboard that displays current weather, forecasts, and interactive maps with location-based services.",
    thumbnail: "https://placehold.co/400x300/06b6d4/ffffff?text=Weather+App",
    images: [
      "https://placehold.co/800x600/06b6d4/ffffff?text=Current+Weather",
      "https://placehold.co/800x600/3b82f6/ffffff?text=7-Day+Forecast",
      "https://placehold.co/800x600/1e40af/ffffff?text=Weather+Maps",
    ],
    technologies: ["Vue.js", "OpenWeather API", "Chart.js", "Leaflet"],
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: 4,
    title: "Portfolio Website",
    description:
      "A modern, responsive portfolio website showcasing projects and skills with smooth animations and optimized performance.",
    thumbnail: "https://placehold.co/400x300/8b5cf6/ffffff?text=Portfolio+Site",
    images: [
      "https://placehold.co/800x600/8b5cf6/ffffff?text=Homepage+Hero",
      "https://placehold.co/800x600/7c3aed/ffffff?text=Projects+Gallery",
      "https://placehold.co/800x600/6d28d9/ffffff?text=About+Section",
    ],
    technologies: ["Next.js", "Framer Motion", "Tailwind CSS", "TypeScript"],
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: 5,
    title: "Social Media Dashboard",
    description:
      "An analytics dashboard for social media management with data visualization, scheduling tools, and performance metrics.",
    thumbnail:
      "https://placehold.co/400x300/f59e0b/ffffff?text=Social+Dashboard",
    images: [
      "https://placehold.co/800x600/f59e0b/ffffff?text=Analytics+Overview",
      "https://placehold.co/800x600/d97706/ffffff?text=Post+Scheduler",
      "https://placehold.co/800x600/b45309/ffffff?text=Engagement+Metrics",
    ],
    technologies: ["React", "D3.js", "Python", "Django", "PostgreSQL"],
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: 6,
    title: "Fitness Tracking App",
    description:
      "A mobile-responsive fitness app with workout tracking, progress visualization, and personalized training plans.",
    thumbnail:
      "https://placehold.co/400x300/ef4444/ffffff?text=Fitness+Tracker",
    images: [
      "https://placehold.co/800x600/ef4444/ffffff?text=Workout+Tracker",
      "https://placehold.co/800x600/dc2626/ffffff?text=Progress+Charts",
      "https://placehold.co/800x600/b91c1c/ffffff?text=Training+Plans",
    ],
    technologies: ["React Native", "Firebase", "Chart.js", "Redux"],
    liveUrl: "#",
    githubUrl: "#",
  },
];

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) =>
        prev === selectedProject.images.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const prevImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProject.images.length - 1 : prev - 1,
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            My Projects
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A collection of projects I've worked on, showcasing various
            technologies and solutions. Click on any project to view more
            details and images.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
              onClick={() => openModal(project)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to view details
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedProject.title}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Image Gallery */}
                <div className="relative mb-6">
                  <img
                    src={selectedProject.images[currentImageIndex]}
                    alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-64 sm:h-80 object-cover rounded-lg"
                  />

                  {/* Navigation buttons */}
                  {selectedProject.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                      >
                        ←
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                      >
                        →
                      </button>
                    </>
                  )}

                  {/* Image indicators */}
                  {selectedProject.images.length > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                      {selectedProject.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            currentImageIndex === index
                              ? "bg-blue-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    About This Project
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Technologies */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {selectedProject.liveUrl && (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                      <FontAwesomeIcon
                        icon={faExternalLinkAlt}
                        className="w-4 h-4 mr-2"
                      />
                      View Live Project
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                      <FontAwesomeIcon
                        icon={faGithubBrand}
                        className="w-4 h-4 mr-2"
                      />
                      View Source Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
