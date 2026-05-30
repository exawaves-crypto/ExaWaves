import React from 'react';
import { motion } from 'framer-motion';
import { Search, PenTool, TestTube, Rocket } from 'lucide-react';
import './Process.css';

const steps = [
  {
    icon: <Search size={28} />,
    title: "Requirement Analysis",
    description: "We dive deep into your business goals, target audience, and functional requirements to create a solid foundation."
  },
  {
    icon: <PenTool size={28} />,
    title: "Custom Development",
    description: "Our expert engineers build scalable, secure, and modern solutions tailored exactly to your specifications."
  },
  {
    icon: <TestTube size={28} />,
    title: "Testing & Optimization",
    description: "Rigorous quality assurance, performance optimization, and security testing ensure a flawless product."
  },
  {
    icon: <Rocket size={28} />,
    title: "Deployment & Support",
    description: "Smooth launch strategy followed by dedicated ongoing maintenance and feature updates."
  }
];

const Process = () => {
  return (
    <section id="process" className="section container">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Our <span className="gradient-text">Process</span></h2>
        <p className="section-subtitle">
          A streamlined, transparent approach to turning your vision into a robust digital reality.
        </p>
      </motion.div>

      <div className="timeline-container">
        <div className="timeline-line"></div>
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className="timeline-content glass">
              <div className="timeline-number glow-primary">{index + 1}</div>
              <div className="timeline-icon">
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Process;
