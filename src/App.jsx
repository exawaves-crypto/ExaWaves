import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import WhyChooseUs from './components/WhyChooseUs';
import Process from './components/Process';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Verify from './pages/Verify';

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Admin routes - no Navbar/Footer
  const isAdminRoute = pathname.startsWith('/admin');
  const isVerifyRoute = pathname.startsWith('/verify');
  const isSpecialRoute = isAdminRoute || isVerifyRoute;

  return (
    <>
      {!isSpecialRoute && (
        <>
          <div className="bg-blobs">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>
          </div>
          <Navbar />
        </>
      )}
      
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <WhyChooseUs />
              <Testimonials />
            </>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/process" element={<Process />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Public Verification */}
          <Route path="/verify/:certificateId" element={<Verify />} />
        </Routes>
      </main>

      {!isSpecialRoute && <Footer />}
    </>
  );
}

export default App;
