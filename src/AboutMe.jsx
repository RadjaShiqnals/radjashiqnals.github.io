import React from 'react';
import { useLanguage } from './LanguageContext';

function AboutMe() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-md rounded p-8 m-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
          {language === 'en' ? 'About Me' : 'Tentang Saya'}
        </h1>
        <p className="text-gray-600 text-center mb-8">
          {language === 'en' ? 'My name is Radja Genta Saputra, an enthusiastic web and game developer from Probolinggo, East Java. I am the second of three siblings. I study at SMK Telkom Malang, focusing on Software Engineering (RPL).' : 'Nama saya Radja Genta Saputra, seorang pengembang web dan game yang antusias dari Probolinggo, Jawa Timur. Saya adalah anak kedua dari tiga bersaudara. Saya bersekolah di SMK Telkom Malang, dengan fokus pada jurusan Rekayasa Perangkat Lunak (RPL).'}
        </p>
        <div className="flex justify-around items-center mb-4">
          <div className="w-24 rounded-full overflow-hidden">
            <img src="src/assets/img/about-me-profile.png" alt="Radja Shiqnals" className="w-full h-full object-cover" />
          </div>
        </div>
        <p className="text-gray-600 text-center mb-8">
          {language === 'en' ? 'I have a deep interest in software development and computer networks, and I am committed to continuously improving my coding skills. Additionally, I enjoy playing online games and exploring new technologies to develop challenging personal projects.' : 'Saya memiliki ketertarikan yang mendalam dalam pengembangan perangkat lunak dan jaringan komputer, serta berkomitmen untuk terus meningkatkan keterampilan coding saya. Selain itu, saya gemar bermain game online dan mengeksplorasi teknologi baru untuk mengembangkan proyek-proyek pribadi yang menantang.'}
        </p>
        <p className="text-gray-600 text-center mb-8">
          <b>{language === 'en' ? 'Education' : 'Pendidikan'}</b>
          <br />
          <a href="https://www.smktelkom-mlg.sch.id" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">SMK Telkom Malang</a>
        </p>
        <p className="text-gray-600 text-center mb-8">
          <b>{language === 'en' ? 'Social Media' : 'Media Sosial'}</b>
          <br />
          <a href="https://www.youtube.com/@RadjaShiqnals" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            <img src="src/assets/img/youtube.png" alt="youtube" className="w-6 mr-2 inline" />
            RadjaShiqnals
          </a>
          <br />
          <a href="https://twitter.com/RadjaShiqnals" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            <img src="src/assets/img/XSocialMedia.png" alt="X" className="w-6 mr-2 inline" />
            RadjaShiqnals
          </a>
          <br />
          <a href="https://www.linkedin.com/in/radja-genta-saputra/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            <img src="src/assets/img/linkedin.png" alt="linkedin" className="w-6 mr-2 inline" />
            Radja Genta Saputra
          </a>
        </p>
        <p className="text-gray-600 text-center mb-8">
          {language === 'en' ? 'Always happy to share with you, please visit my ' : 'Selalu senang ketika bisa berbagi denganmu, silakan kunjungi '}
          <a href="/projects">{language === 'en' ? 'projects' : 'proyek'}</a>
          {language === 'en' ? ' or ' : ' atau '}
          <a href="mailto:radjagentasaputra@gmail.com" className="text-blue-500 hover:underline">{language === 'en' ? 'contact me' : 'hubungi saya'}</a>
          {language === 'en' ? ' to share experiences or collaborate!' : ' untuk berbagi pengalaman atau berkolaborasi!'}
        </p>
      </div>
    </div>
  );
}

export default AboutMe;