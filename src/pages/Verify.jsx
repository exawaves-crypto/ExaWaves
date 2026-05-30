import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck, ShieldX, AlertTriangle, ArrowLeft, Calendar, Briefcase, User, Building, BookOpen, Clock, Camera } from 'lucide-react';
import './Verify.css';

const Verify = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    setLoading(true);
    setNotFound(false);

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_number', certificateId)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setCertificate(data);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="verify-page">
        <div className="verify-loading">
          <div className="admin-loader" style={{ borderTopColor: 'var(--primary-color)' }}></div>
          <p>Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="verify-page">
        <div className="verify-card verify-not-found">
          <div className="verify-status-icon not-found">
            <AlertTriangle size={40} />
          </div>
          <h1>Certificate Not Found</h1>
          <p>The certificate number <code>{certificateId}</code> does not exist in our records.</p>
          <p className="verify-hint">Please check the certificate number and try again, or contact ExaWaves Technology for assistance.</p>
          <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isValid = certificate.status === 'valid';

  return (
    <div className="verify-page">
      <div className="verify-bg-effects">
        <div className="verify-blob verify-blob-1"></div>
        <div className="verify-blob verify-blob-2"></div>
      </div>

      <div className="verify-card">
        {/* Status Badge */}
        <div className={`verify-status-banner ${isValid ? 'valid' : 'revoked'}`}>
          <div className="verify-status-icon">
            {isValid ? <ShieldCheck size={32} /> : <ShieldX size={32} />}
          </div>
          <div>
            <h2>{isValid ? 'Certificate Verified' : 'Certificate Revoked'}</h2>
            <p>{isValid
              ? 'This certificate is authentic and currently valid.'
              : 'This certificate has been revoked and is no longer valid.'
            }</p>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="verify-details">
          <div className="verify-header-info">
            <div className="verify-company" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <img src="/ExaWaves Logo.svg" alt="ExaWaves Logo" style={{ height: '44px', objectFit: 'contain' }} />
              <p style={{ margin: 0, fontWeight: 500, color: '#6B7280', fontSize: '0.95rem' }}>Internship Certificate</p>
            </div>
            <div className="verify-cert-number">
              {certificate.certificate_number}
            </div>
          </div>

          <div className="verify-student-name">
            {certificate.photo_url && (
              <div className="verify-photo-section">
                <div className="verify-photo-frame">
                  <img src={certificate.photo_url} alt={certificate.student_name} />
                </div>
              </div>
            )}
            {certificate.student_name}
          </div>

          <div className="verify-info-grid">
            <div className="verify-info-item">
              <div className="verify-info-icon"><Briefcase size={16} /></div>
              <div>
                <span className="verify-info-label">Role</span>
                <span className="verify-info-value">{certificate.intern_role}</span>
              </div>
            </div>

            <div className="verify-info-item">
              <div className="verify-info-icon"><User size={16} /></div>
              <div>
                <span className="verify-info-label">Training Partner</span>
                <span className="verify-info-value">{certificate.training_partner}</span>
              </div>
            </div>
            <div className="verify-info-item">
              <div className="verify-info-icon"><Clock size={16} /></div>
              <div>
                <span className="verify-info-label">Duration</span>
                <span className="verify-info-value">{certificate.duration}</span>
              </div>
            </div>
            <div className="verify-info-item">
              <div className="verify-info-icon"><Calendar size={16} /></div>
              <div>
                <span className="verify-info-label">Internship Period</span>
                <span className="verify-info-value">
                  {formatDate(certificate.start_date)} — {formatDate(certificate.end_date)}
                </span>
              </div>
            </div>
            <div className="verify-info-item">
              <div className="verify-info-icon"><Calendar size={16} /></div>
              <div>
                <span className="verify-info-label">Issue Date</span>
                <span className="verify-info-value">{formatDate(certificate.issued_date)}</span>
              </div>
            </div>
          </div>

          {certificate.projects && certificate.projects.length > 0 && (
            <div className="verify-projects">
              <div className="verify-projects-header">
                <BookOpen size={16} />
                <span>Projects Worked On</span>
              </div>
              <ul className="verify-projects-list">
                {certificate.projects.map((project, i) => (
                  <li key={i}>{project}</li>
                ))}
              </ul>
              {certificate.project_descriptions && (
                <p className="verify-projects-desc">{certificate.project_descriptions}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="verify-footer">
          <Link to="/" className="verify-back-link">
            <ArrowLeft size={14} />
            <span>Visit ExaWaves</span>
          </Link>
          <p className="verify-footer-note">
            This is an automated verification. For queries, contact{' '}
            <a href="mailto:exawaves@gmail.com">exawaves@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
