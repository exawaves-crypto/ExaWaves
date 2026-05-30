import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, MessageSquareQuote, Award, LogOut, Menu, X, Sun, Moon, ScrollText, FileHeart, Users } from 'lucide-react';
import TestimonialsManager from './admin/TestimonialsManager';
import CertificateManager from './admin/CertificateManager';
import PatentLetterManager from './admin/PatentLetterManager';
import RecommendationLetterManager from './admin/RecommendationLetterManager';
import CandidateManager from './admin/CandidateManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('candidates');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('adminTheme', newTheme);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const tabs = [
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'patents', label: 'Patent Letters', icon: ScrollText },
    { id: 'recommendations', label: 'Recommendations', icon: FileHeart },
  ];

  return (
    <div className="admin-dashboard" data-theme={theme}>
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <LayoutDashboard size={24} />
            <span>ExaWaves Admin</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <h2 className="topbar-title">
            {activeTab === 'candidates' ? 'Candidate Hub' : activeTab === 'testimonials' ? 'Testimonials Manager' : activeTab === 'certificates' ? 'Certificate Generator' : activeTab === 'patents' ? 'Patent Letter Generator' : 'Recommendation Letter Generator'}
          </h2>
          <div className="topbar-actions">
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="topbar-logout" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <main className="admin-content">
          {activeTab === 'candidates' && <CandidateManager />}
          {activeTab === 'testimonials' && <TestimonialsManager />}
          {activeTab === 'certificates' && <CertificateManager />}
          {activeTab === 'patents' && <PatentLetterManager />}
          {activeTab === 'recommendations' && <RecommendationLetterManager />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
