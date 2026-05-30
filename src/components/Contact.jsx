import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessType: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    // Create form data object for Google Apps Script
    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email);
    form.append('businessType', formData.businessType);
    form.append('message', formData.message);

    // The Web App URL provided by the user
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwWk3l-iDfsuh0KyGNlPdNdG8DUXP-KbVikuM-TveZ0R7ymUMlfpP2U9zuWpUQYZEj2/exec';

    try {
      // Using no-cors because Google Apps Script redirects the POST request and prevents reading the response directly
      await fetch(scriptURL, {
        method: 'POST',
        body: form,
        mode: 'no-cors'
      });
      
      // Since mode is no-cors, we assume success if no network error occurred
      setStatus('success');
      setFormData({ name: '', email: '', businessType: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error("Error submitting form", error);
      setStatus('error');
      
      // Reset error message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact" className="section container">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Ready to <span className="gradient-text">Build?</span></h2>
        <p className="section-subtitle">
          Let's discuss how ExaWaves Technology can transform your ideas into scalable digital realities.
        </p>
      </motion.div>

      <div className="contact-layout">
        <motion.div 
          className="contact-info glass-dark"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3>Contact Information</h3>
          <p className="contact-desc">Fill up the form and our team will get back to you within 24 hours.</p>
          
          <div className="info-items">
            <div className="info-item">
              <Phone size={20} color="var(--accent-gold)" />
              <a href="tel:+918124393132" style={{ color: 'inherit', textDecoration: 'none' }}>+91-8124393132</a>
            </div>
            <div className="info-item">
              <Mail size={20} color="var(--accent-gold)" />
              <a href="mailto:exawaves@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>exawaves@gmail.com</a>
            </div>
            <div className="info-item">
              <MapPin size={20} color="var(--accent-gold)" />
              <span>Global Remote HQ</span>
            </div>
          </div>

          <div className="contact-socials">
            <a href="https://wa.me/918124393132" target="_blank" rel="noopener noreferrer" className="social-icon"><MessageCircle size={24} /> <span>WhatsApp Us</span></a>
          </div>
          

        </motion.div>

        <motion.div 
          className="contact-form-container glass"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name" 
                required 
                disabled={status === 'loading'}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email" 
                required 
                disabled={status === 'loading'}
              />
            </div>
            <div className="form-group">
              <label>Business Type</label>
              <select 
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
                disabled={status === 'loading'}
              >
                <option value="">Select an option</option>
                <option value="startup">Startup</option>
                <option value="enterprise">Enterprise</option>
                <option value="education">Educational Institution</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Project Requirement</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4" 
                placeholder="Tell us about your project goals..." 
                required
                disabled={status === 'loading'}
              ></textarea>
            </div>
            
            {status === 'success' && (
              <div className="form-feedback success" style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1', marginBottom: '15px' }}>
                <CheckCircle size={20} />
                <span>Message sent successfully! We will contact you soon.</span>
              </div>
            )}
            
            {status === 'error' && (
              <div className="form-feedback error" style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1', marginBottom: '15px' }}>
                <AlertCircle size={20} />
                <span>Something went wrong. Please try again later.</span>
              </div>
            )}

            <div className="form-group full-width">
              <button 
                type="submit" 
                className="btn-primary submit-btn"
                disabled={status === 'loading' || status === 'success'}
                style={{ opacity: (status === 'loading' || status === 'success') ? 0.7 : 1, cursor: (status === 'loading' || status === 'success') ? 'not-allowed' : 'pointer' }}
              >
                {status === 'loading' ? (
                  <>Sending... <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /></>
                ) : status === 'success' ? (
                  <>Sent <CheckCircle size={18} /></>
                ) : (
                  <>Send Message <Send size={18} /></>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
