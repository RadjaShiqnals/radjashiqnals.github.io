import React from 'react';
import profileData from '../data/profile.json';
import { Link } from 'react-router-dom';

const Home = () => {
  const quickIntro = "I'm a passionate and driven Full-Stack Developer from Malang, East Java, with a strong foundation in modern web technologies. I enjoy building seamless, scalable, and impactful applications.";

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-2">Welcome! I'm {profileData.profile_name}</h1>
      <p className="text-lg text-slate-400 mb-6">@{profileData.nickname}</p>
      
      <p className="mb-4 leading-relaxed">{quickIntro}</p>
      
      <Link to="/about" className="text-blue-400 hover:underline font-semibold">
        Read more about me &rarr;
      </Link>
    </div>
  );
};

export default Home;
