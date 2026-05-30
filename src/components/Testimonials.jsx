import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Testimonials.css';

// Fallback data in case Supabase is unreachable
const fallbackTestimonials = [
  {
    quote: "ExaWaves Technology transformed our business operations with a custom SaaS platform. Their attention to detail and scalable architecture is unmatched.",
    author: "Sarah Johnson",
    role: "CEO, TechFlow Inc.",
    initial: "S"
  },
  {
    quote: "Working with Hema and her team was a game-changer. They delivered our e-commerce solution ahead of schedule with flawless execution.",
    author: "David Chen",
    role: "Founder, RetailPro",
    initial: "D"
  },
  {
    quote: "The AI automation tools they built for us saved hundreds of hours per month. A truly visionary team that understands modern business needs.",
    author: "Elena Rodriguez",
    role: "Operations Director, EduSmart",
    initial: "E"
  }
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setTestimonials(data);
        }
      } catch {
        // Fallback to hardcoded data silently
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section className="section container">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Client <span className="gradient-text">Success Stories</span></h2>
        <p className="section-subtitle">
          Don't just take our word for it. See what our partners say about building the future with us.
        </p>
      </motion.div>

      <div className="testimonials-grid">
        {loading ? (
          // Loading skeletons
          [1, 2, 3].map((i) => (
            <div key={i} className="testimonial-card glass testimonial-skeleton">
              <div className="skeleton-line wide"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line medium"></div>
              <div className="skeleton-author">
                <div className="skeleton-avatar"></div>
                <div>
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-line shorter"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          testimonials.map((testi, index) => (
            <motion.div 
              key={testi.id || index}
              className="testimonial-card glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="quote-icon">
                <Quote size={32} color="#DCCEF9" />
              </div>
              <p className="testi-quote">"{testi.quote}"</p>
              <div className="testi-author">
                <div className="author-avatar glow-accent">
                  {testi.initial}
                </div>
                <div className="author-info">
                  <h4>{testi.author}</h4>
                  <p>{testi.role}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
};

export default Testimonials;
