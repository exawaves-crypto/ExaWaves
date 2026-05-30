import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Award } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="section container">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">About <span className="gradient-text">ExaWaves</span></h2>
        <p className="section-subtitle">
          A modern software solutions company building scalable digital products and automation systems.
        </p>
      </motion.div>

      <motion.div 
        className="founder-section glass-dark"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '60px' }}
      >
        <div className="founder-content">
          <h3 className="gradient-text">Leadership</h3>
          <h4>Hema Latha</h4>
          <p className="role">Founder & CTO</p>
          <p className="bio">
            Spearheading technological innovation at ExaWaves, Hema brings a visionary approach to software architecture and digital transformation. With expertise in building robust, scalable SaaS products and enterprise solutions, she leads our mission to deliver world-class technology that solves complex business challenges.
          </p>
        </div>
      </motion.div>

      <div className="about-grid">
        <motion.div 
          className="about-card glass"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="icon-wrapper glow-primary">
            <Target size={28} color="var(--primary-color)" />
          </div>
          <h3>Our Mission</h3>
          <p>To empower businesses by building innovative, scalable, and high-performance digital products that drive growth and efficiency.</p>
        </motion.div>

        <motion.div 
          className="about-card glass"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="icon-wrapper glow-accent">
            <Eye size={28} color="#8B5CF6" />
          </div>
          <h3>Our Vision</h3>
          <p>To be the leading technology partner globally, known for crafting future-ready software solutions and transforming digital landscapes.</p>
        </motion.div>

        <motion.div 
          className="about-card glass"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="icon-wrapper glow-primary">
            <Award size={28} color="#10B981" />
          </div>
          <h3>Core Values</h3>
          <p>Innovation, Integrity, Excellence, and Customer-Centricity form the foundation of everything we build at ExaWaves.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
