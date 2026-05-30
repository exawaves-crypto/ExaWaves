import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, Globe, MessageSquare, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer glass-dark">
      <div className="container footer-container">
        <div className="footer-brand">
          <Link to="/" className="logo">
            <span className="gradient-text">ExaWaves</span> Technology
          </Link>
          <p className="footer-desc">
            We build what your business needs. Custom SaaS, automated tools, and scalable software solutions.
          </p>
          <div className="social-links">
            <a href="#" className="social-link"><Globe size={20} /></a>
            <a href="#" className="social-link"><Share2 size={20} /></a>
            <a href="https://wa.me/918124393132" target="_blank" rel="noopener noreferrer" className="social-link"><MessageSquare size={20} /></a>
            <a href="mailto:exawaves@gmail.com" className="social-link"><Mail size={20} /></a>
          </div>
        </div>

        <div className="footer-links">
          <div className="link-group">
            <h4>Quick Links</h4>
            <Link to="/about">About Us</Link>
            <Link to="/services">Our Services</Link>
            <Link to="/process">How We Work</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="link-group">
            <h4>Services</h4>
            <a href="#">SaaS Development</a>
            <a href="#">Web Development</a>
            <a href="#">E-Commerce</a>
            <a href="#">AI Automation</a>
          </div>
          <div className="link-group">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} ExaWaves Technology. All rights reserved.</p>
        <p className="founder-credit">Founded by <span className="gradient-text">Hema Latha</span></p>
      </div>
    </footer>
  );
};

export default Footer;
