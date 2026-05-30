import React from 'react';
import { motion } from 'framer-motion';
import { Code2, IndianRupee, Clock, Layers, HeadphonesIcon } from 'lucide-react';
import './WhyChooseUs.css';

const features = [
  {
    id: 1,
    icon: <Code2 size={26} />,
    title: "Custom Solutions",
    description: "Built specifically for your unique business logic and workflows. We architect software that aligns perfectly with your operations."
  },
  {
    id: 2,
    icon: <Clock size={26} />,
    title: "Fast Delivery",
    description: "Agile methodology ensuring quick turnaround times without compromising on code quality, security, or performance."
  },
  {
    id: 3,
    icon: <IndianRupee size={26} />,
    title: "Competitive Pricing",
    description: "Premium enterprise-grade software solutions delivered at highly competitive and transparent rates."
  },
  {
    id: 4,
    icon: <Layers size={26} />,
    title: "Scalable Architecture",
    description: "Future-proof technology stacks designed to grow seamlessly and handle increased demand as your business expands."
  },
  {
    id: 5,
    icon: <HeadphonesIcon size={26} />,
    title: "Dedicated Support",
    description: "Reliable, ongoing maintenance and technical support to ensure your platforms run flawlessly post-launch."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const WhyChooseUs = () => {
  return (
    <section id="why-choose-us" className="wcu-corporate-wrapper">
      <div className="section container">
        <div className="wcu-corporate-header">
          <motion.h2 
            className="wcu-corporate-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why Choose Us
          </motion.h2>
          <motion.p 
            className="wcu-corporate-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            We deliver highly reliable, scalable, and secure software architecture. Here is why enterprise clients trust ExaWaves Technology with their critical infrastructure.
          </motion.p>
        </div>

        <motion.div 
          className="corporate-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.id} 
              className="corporate-card"
              variants={itemVariants}
            >
              <div className="corp-icon-wrapper">
                {feature.icon}
              </div>
              <div className="corp-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
