import React from 'react';
import profileData from '../data/profile.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faYoutube, faGithub } from '@fortawesome/free-brands-svg-icons';

const About = () => {
  const quickIntro = "I'm a passionate and driven Full-Stack Developer from Malang, East Java, with a strong foundation in modern web technologies. I enjoy building seamless, scalable, and impactful applications.";

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">About Me</h1>
      <p className="mb-8 leading-relaxed">{quickIntro}</p>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-slate-700 pb-2">Education</h2>
          <p><span className="font-semibold">SMK Telkom Malang</span> (2019–2025)</p>
          <p className="text-slate-400">Graduated from the RPL (Software Engineering) track.</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-slate-700 pb-2">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg">Front-End</h3>
              <ul className="list-disc list-inside text-slate-400">
                <li>Vue.js</li>
                <li>React</li>
                <li>HTML</li>
                <li>CSS</li>
                <li>TailwindCSS</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Back-End</h3>
              <ul className="list-disc list-inside text-slate-400">
                <li>Laravel</li>
                <li>PHP</li>
                <li>MySQL</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg">UI/UX Design</h3>
              <ul className="list-disc list-inside text-slate-400">
                <li>Figma</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-slate-700 pb-2">Experience</h2>
          <p><span className="font-semibold">Full Stack Engineer</span> at SIDIGS (Mid-2025 - Present)</p>
          <p><span className="font-semibold">Full-Stack Developer Intern</span> at SIDIGS (May 2024 - April 2025)</p>
          <p className="text-slate-400 mt-2">Contributed to an 'all-in-one' school management application, helping to digitize school activities.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-4">Find me on</h2>
      <div className="flex flex-col gap-4">
        <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors flex items-center gap-4 p-2 rounded-md hover:bg-slate-800">
          <FontAwesomeIcon icon={faLinkedin} size="2x" />
          <span className="font-semibold">Radja Genta Saputra</span>
        </a>
        <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors flex items-center gap-4 p-2 rounded-md hover:bg-slate-800">
          <FontAwesomeIcon icon={faGithub} size="2x" />
          <span className="font-semibold">RadjaShiqnals</span>
        </a>
        <a href={profileData.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors flex items-center gap-4 p-2 rounded-md hover:bg-slate-800">
          <FontAwesomeIcon icon={faYoutube} size="2x" />
          <span className="font-semibold">RadjaShiqnals</span>
        </a>
      </div>
    </div>
  );
};

export default About;
