import React, { useState } from 'react';
import { useTrail, animated } from '@react-spring/web';
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useLanguage } from './LanguageContext';

function Home() {
  const { language } = useLanguage();
  const title = language === 'en' ? 'Hi everyone, I\'m Radja Genta Saputra a Software Engineer!' : 'Halo semuanya, saya Radja Genta Saputra seorang Software Engineer!';
  const items = language === 'en' ? [
    'I\'m Radja Shiqnals, a student from SMK Telkom Malang.',
    'I am passionate about programming, especially in the field of web development.',
    'I have a deep understanding of the web development process and have experience in building responsive and efficient websites using various technologies such as HTML, CSS, and JavaScript.',
    'I am also proficient in using JavaScript frameworks like React and Vue.js to build dynamic and user-friendly applications.'
  ] : [
    'Saya Radja Shiqnals, seorang siswa dari SMK Telkom Malang.',
    'Saya sangat tertarik dengan pemrograman, terutama di bidang pengembangan web.',
    'Saya memiliki pemahaman yang mendalam tentang proses pengembangan web dan memiliki pengalaman dalam membangun situs web yang responsif dan efisien menggunakan berbagai teknologi seperti HTML, CSS, dan JavaScript.',
    'Saya juga mahir menggunakan kerangka kerja JavaScript seperti React dan Vue.js untuk membangun aplikasi yang dinamis dan ramah pengguna.'
  ];

  const trail = useTrail(items.length, {
    opacity: 1,
    x: 0,
    from: { opacity: 0, x: -500 },
    config: { mass: 5, tension: 2000, friction: 200 },
  });

  const [letterIndex, setLetterIndex] = useState(0);

  const handleType = () => {
    setTimeout(() => {
      setLetterIndex((prevIndex) => prevIndex + 1);
      if (letterIndex < title.length) {
        handleType();
      }
    }, 300);
  };

  React.useEffect(() => {
    handleType();
  }, [letterIndex]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="flex items-center justify-center">
          <img src="src/assets/img/about-me-profile.jpg" alt="Radja Shiqnals" className="w-32 h-32 rounded-full object-cover" />
        </div>
        <h1 className="pt-6 text-3xl font-bold  text-gray-800 mb-4 text-center">
          <motion.span
            initial={{ x: -500 }}
            animate={{ x: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.25 }}
          >
            {title.slice(0, letterIndex)}
            <motion.span
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {title[letterIndex] && '_'}
            </motion.span>
          </motion.span>
        </h1>
        <div className="text-gray-600 text-center mb-8">
          {trail.map((style, index) => (
            <animated.p key={index} style={style} className="mb-4">
              {items[index]}
            </animated.p>
          ))}
        </div>
        <div className="flex justify-center mb-10">
          <NavLink to="/about-me" className="font-bold text-lg mr-4">
            <motion.span
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {buttonLetterEffect(language === 'en' ? 'About Me' : 'Tentang Saya')}
            </motion.span>
          </NavLink>
          <NavLink to="/projects" className="font-bold text-lg">
            <motion.span
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {buttonLetterEffect(language === 'en' ? 'Projects' : 'Proyek')}
            </motion.span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

function buttonLetterEffect(text) {
  const [letterIndex, setLetterIndex] = useState(0);

  React.useEffect(() => {
    setTimeout(() => {
      setLetterIndex((prevIndex) => prevIndex + 1);
    }, 100);
  }, [letterIndex]);

  return (
    <>
      {text.slice(0, letterIndex)}
      <motion.span
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {text[letterIndex] && '_'}
      </motion.span>
    </>
  );
}

export default Home;