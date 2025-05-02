import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <header>
        <Navbar />
      </header>
      
      <main>
        <Outlet />
      </main>
      
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout; 