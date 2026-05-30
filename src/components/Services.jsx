import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ShoppingCart, Settings, Users, MonitorPlay, Zap, LayoutTemplate } from 'lucide-react';
import './Services.css';

const servicesList = [
  {
    title: "Custom SaaS Development",
    description: "End-to-end SaaS platforms built with scalable architecture, secure multi-tenancy, and seamless user experiences.",
    icon: <Settings size={32} />,
    color: "#3B82F6",
    examples: "CRM systems, HR software, Billing systems"
  },
  {
    title: "Website Development",
    description: "High-performance, SEO-optimized, and visually stunning websites tailored to your brand identity.",
    icon: <Globe size={32} />,
    color: "#8B5CF6",
    examples: "Corporate sites, Portfolios, SEO websites"
  },
  {
    title: "E-Commerce Solutions",
    description: "Robust online stores with secure payment gateways, inventory management, and intuitive shopping experiences.",
    icon: <ShoppingCart size={32} />,
    color: "#10B981",
    examples: "Online stores, Multi-vendor platforms"
  },
  {
    title: "Education Solutions",
    description: "Comprehensive digital platforms for educational institutions to manage learning and administration.",
    icon: <MonitorPlay size={32} />,
    color: "#F59E0B",
    examples: "LMS platforms, Exam portals, Student dashboards"
  },
  {
    title: "Industry-Based Platforms",
    description: "Specialized platforms designed for specific industry needs and user demographics.",
    icon: <Users size={32} />,
    color: "#EC4899",
    examples: "Matrimony websites, Job portals, Booking systems"
  },
  {
    title: "Automation & Smart Tools",
    description: "AI-driven automation tools and custom software to streamline your business operations.",
    icon: <Zap size={32} />,
    color: "#06B6D4",
    examples: "AI tools, QR generators, Gym management systems"
  }
];

const Services = () => {
  return (
    <section id="services" className="section container">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Our <span className="gradient-text">Services</span></h2>
        <p className="section-subtitle">
          We deliver comprehensive software solutions designed to scale your business and automate your workflows.
        </p>
      </motion.div>

      <div className="services-grid">
        {servicesList.map((service, index) => (
          <motion.div 
            key={index}
            className="service-card glass"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="service-icon" style={{ backgroundColor: `${service.color}15`, color: service.color }}>
              {service.icon}
            </div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-desc">{service.description}</p>
            <div className="service-examples">
              <strong>Examples:</strong> {service.examples}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Services;
