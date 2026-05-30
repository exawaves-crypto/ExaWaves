import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './CertificateTemplate.css';

const CertificateTemplate = forwardRef(({ certificate }, ref) => {
  const {
    certificate_number,
    student_name,
    intern_role,
    training_partner,
    start_date,
    end_date,
    duration,
    projects,
    project_descriptions,
    issued_date,
    status,
  } = certificate;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Use your production domain for QR codes
  const verifyUrl = `${window.location.origin}/verify/${certificate_number}`;

  return (
    <div className="cert-template" ref={ref}>
      {/* Decorative Border */}
      <div className="cert-border">
        <div className="cert-inner">
          {/* Background Watermark */}
          <div className="cert-watermark">
            <img src="/ExaWaves Logo.svg" alt="" />
          </div>

          {/* Corner accents */}
          <div className="cert-corner cert-corner-tl"></div>
          <div className="cert-corner cert-corner-tr"></div>
          <div className="cert-corner cert-corner-bl"></div>
          <div className="cert-corner cert-corner-br"></div>

          {/* Header */}
          <div className="cert-header">
            <div className="cert-company-logo">
              <img src="/ExaWaves Logo.svg" alt="ExaWaves Logo" style={{ height: '60px', objectFit: 'contain' }} />
            </div>
            <div className="cert-number-badge">
              {certificate_number}
            </div>
          </div>

          {/* Title */}
          <div className="cert-title-section">
            <p className="cert-label">Certificate of Completion</p>
            <h1 className="cert-title">INTERNSHIP CERTIFICATE</h1>
            <div className="cert-divider"></div>
          </div>

          {/* Content */}
          <div className="cert-body">
            <p className="cert-text">This is to certify that</p>
            <h2 className="cert-student-name">{student_name}</h2>
            <p className="cert-text">
              has successfully completed the <strong>{intern_role}</strong> internship
              under the mentorship of <strong>{training_partner}</strong>.
            </p>
            <p className="cert-text cert-duration">
              Duration: <strong>{duration}</strong> ({formatDate(start_date)} — {formatDate(end_date)})
            </p>

            {projects && projects.length > 0 && (
              <div className="cert-projects">
                <p className="cert-projects-label">Projects:</p>
                <p className="cert-projects-list">{projects.join(' • ')}</p>
              </div>
            )}

            {project_descriptions && (
              <p className="cert-text cert-desc">{project_descriptions}</p>
            )}
          </div>

          {/* Footer */}
          <div className="cert-footer">
            <div className="cert-signature">
              <div className="cert-sig-line"></div>
              <p className="cert-sig-name">Hemalatha</p>
              <p className="cert-sig-title">Founder & CEO, ExaWaves Technology</p>
            </div>

            <div className="cert-qr-section">
              <QRCodeSVG
                value={verifyUrl}
                size={80}
                bgColor="transparent"
                fgColor="#2A111E"
                level="M"
              />
              <p className="cert-qr-label">Scan to Verify</p>
            </div>

            <div className="cert-issue-info">
              <p>Issued: <strong>{formatDate(issued_date)}</strong></p>
              <p>Status: <strong style={{ color: status === 'valid' ? '#16a34a' : '#dc2626' }}>
                {status === 'valid' ? '✓ Valid' : '✗ Revoked'}
              </strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
