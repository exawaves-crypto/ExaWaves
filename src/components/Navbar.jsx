import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'glass' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <img src="/ExaWaves Logo.svg" alt="ExaWaves Technology Logo" className="logo-img" />
        </Link>
        
        <nav className="desktop-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/services" className="nav-link">Services</Link>
          <Link to="/process" className="nav-link">Process</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/contact" className="btn-primary" style={{ padding: '8px 20px', marginLeft: '10px' }}>Get Started</Link>
        </nav>

        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <motion.div 
          className="mobile-nav glass-dark"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link to="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
          <Link to="/process" onClick={() => setMobileMenuOpen(false)}>Process</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <Link to="/contact" className="btn-primary" onClick={() => setMobileMenuOpen(false)} style={{width: 'fit-content', marginTop: '10px'}}>Get Started</Link>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
