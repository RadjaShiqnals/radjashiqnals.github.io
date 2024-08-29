import React from 'react';

function AboutMe() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-md rounded p-8 m-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
          Tentang Saya
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Nama saya Radja Genta Saputra, seorang pengembang web dan game yang antusias dari Probolinggo, Jawa Timur. Saya adalah anak kedua dari tiga bersaudara. Saya bersekolah di SMK Telkom Malang, dengan fokus pada jurusan Rekayasa Perangkat Lunak (RPL).
        </p>
        
        <div className="flex justify-around items-center mb-4">
          <div className="w-24 rounded-full overflow-hidden">
            <img src="src/assets/img/about-me-profile.png" alt="Radja Shiqnals" className="w-full h-full object-cover" />
          </div>
        </div>
        <p className="text-gray-600 text-center mb-8">
          Saya memiliki ketertarikan yang mendalam dalam pengembangan perangkat lunak dan jaringan komputer, serta berkomitmen untuk terus meningkatkan keterampilan coding saya. Selain itu, saya gemar bermain game online dan mengeksplorasi teknologi baru untuk mengembangkan proyek-proyek pribadi yang menantang.
        </p>
        <p className="text-gray-600 text-center mb-8">
          <b>Pendidikan</b>
          <br />
          <a href="https://www.smktelkom-mlg.sch.id" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">SMK Telkom Malang</a>
        </p>
        <p className="text-gray-600 text-center mb-8">
          <b>Social Media</b>
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
          Selalu senang ketika bisa berbagi denganmu, silakan kunjungi <a href="/projects">proyek</a> atau <a href="mailto:radjagentasaputra@gmail.com" className="text-blue-500 hover:underline">hubungi saya</a> untuk berbagi pengalaman atau berkolaborasi!
        </p>
      </div>
    </div>
  );
}

export default AboutMe;


