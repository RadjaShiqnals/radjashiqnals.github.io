import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children, selectedTag, setSelectedTag }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
        <main className="flex-1 p-4 text-white">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
