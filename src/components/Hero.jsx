import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-container container">
        <div className="hero-background" style={{ backgroundImage: 'url(/hero-realistic-indian-team-female-leader.png)' }}>
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content-wrapper">
          <motion.div 
            className="hero-center-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              We Build What Your Business Needs
            </h1>
            <p className="hero-subtitle">
              Custom SaaS platforms, automation tools, websites, and scalable digital solutions for businesses, startups, and educational institutions.
            </p>
            <div className="hero-cta">
              <Link to="/contact" className="btn-pill">
                Get Started
              </Link>
            </div>
          </motion.div>

          <div className="hero-stats-wrapper">
            <div className="stats-divider"></div>
            <motion.div 
              className="hero-stats-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="stat-item">
                <h3 className="stat-value">100%</h3>
                <p className="stat-label">Client Satisfaction</p>
              </div>
              <div className="stat-item">
                <h3 className="stat-value">50+</h3>
                <p className="stat-label">Projects Delivered</p>
              </div>
              <div className="stat-item">
                <h3 className="stat-value">24/7</h3>
                <p className="stat-label">Technical Support</p>
              </div>
              <div className="stat-item">
                <h3 className="stat-value">10x</h3>
                <p className="stat-label">Growth Accelerated</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
