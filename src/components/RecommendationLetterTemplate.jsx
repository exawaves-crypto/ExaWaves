import React, { forwardRef } from 'react';
import './RecommendationLetterTemplate.css';

const RecommendationLetterTemplate = forwardRef(({ letter }, ref) => {
  const {
    ref_number,
    employee_name,
    designation,
    department,
    date_of_joining,
    date_of_leaving,
    duration,
    skills,
    performance_summary,
    issued_date,
  } = letter;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const skillList = Array.isArray(skills)
    ? skills
    : typeof skills === 'string'
    ? skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const issuedFormatted = formatDate(issued_date || new Date().toISOString());

  return (
    <div className="lor-template" ref={ref}>
      {/* Top color bar */}
      <div className="lor-letterhead-bar"></div>

      <div className="lor-inner">
        {/* Confidential side text */}
        <div className="lor-confidential">Confidential</div>

        {/* Watermark */}
        <div className="lor-watermark">
          <img src="/ExaWaves Logo.svg" alt="" />
        </div>

        {/* ── Letterhead ── */}
        <div className="lor-letterhead">
          <div className="lor-company-info">
            <div className="lor-company-logo">
              <img src="/ExaWaves Logo.svg" alt="ExaWaves Technology" />
            </div>
            <div className="lor-company-details">
              <h2>ExaWaves Technology</h2>
              <p>Software as a Service · Product Development</p>
            </div>
          </div>
          <div className="lor-contact-info">
            <p>exawaves@gmail.com</p>
            <p>www.exawaves.com</p>
            <p>India</p>
          </div>
        </div>

        {/* ── Letter Body ── */}
        <div className="lor-body">
          {/* Reference & Date */}
          <div className="lor-meta-row">
            <div className="lor-ref-number">
              Ref: <span>{ref_number}</span>
            </div>
            <div className="lor-date">
              Date: <span>{issuedFormatted}</span>
            </div>
          </div>

          {/* Title */}
          <div className="lor-title-section">
            <h1 className="lor-title">Letter of Recommendation</h1>
            <div className="lor-title-underline"></div>
          </div>

          {/* Salutation */}
          <p className="lor-salutation">To Whom It May Concern,</p>

          {/* Opening Paragraph */}
          <p className="lor-paragraph">
            It is with great pleasure and without any reservation that I write this letter of recommendation
            for <span className="highlight-name">{employee_name}</span>, who has been associated with{' '}
            <strong>ExaWaves Technology</strong> as a <strong>{designation}</strong> in our{' '}
            <strong>{department}</strong> department.
          </p>

          {/* Employee Details Box */}
          <div className="lor-details-box">
            <div className="lor-details-box-header">
              <h4>Association Details</h4>
            </div>
            <div className="lor-details-grid">
              <div className="lor-detail-item">
                <p className="lor-detail-label">Full Name</p>
                <p className="lor-detail-value">{employee_name}</p>
              </div>
              <div className="lor-detail-item">
                <p className="lor-detail-label">Designation</p>
                <p className="lor-detail-value">{designation}</p>
              </div>
              <div className="lor-detail-item">
                <p className="lor-detail-label">Department</p>
                <p className="lor-detail-value">{department}</p>
              </div>
              <div className="lor-detail-item">
                <p className="lor-detail-label">Duration of Association</p>
                <p className="lor-detail-value">{duration}</p>
              </div>
              <div className="lor-detail-item">
                <p className="lor-detail-label">Date of Joining</p>
                <p className="lor-detail-value">{formatDateShort(date_of_joining)}</p>
              </div>
              <div className="lor-detail-item">
                <p className="lor-detail-label">Date of Relieving</p>
                <p className="lor-detail-value">{formatDateShort(date_of_leaving)}</p>
              </div>
            </div>
          </div>

          {/* Performance Paragraph */}
          <p className="lor-paragraph">
            During the tenure at ExaWaves Technology, {employee_name} has consistently demonstrated
            exceptional professional competence, a strong work ethic, and remarkable dedication to
            every task and responsibility entrusted. Their contributions have been instrumental in
            driving the success of key projects within the organization.
          </p>

          {performance_summary && (
            <p className="lor-paragraph">
              {performance_summary}
            </p>
          )}

          {/* Skills */}
          {skillList.length > 0 && (
            <div className="lor-skills-section">
              <p className="lor-skills-label">Key Competencies & Skills Demonstrated</p>
              <div className="lor-skills-list">
                {skillList.map((skill, idx) => (
                  <span key={idx} className="lor-skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Character & Recommendation */}
          <p className="lor-paragraph">
            {employee_name} is an individual of strong character, integrity, and professionalism. They
            possess excellent communication skills, a collaborative mindset, and a genuine passion for
            continuous learning and growth. Their ability to adapt to challenging situations and deliver
            quality results under pressure has been highly commendable.
          </p>

          {/* Closing */}
          <p className="lor-closing">
            I have no hesitation in recommending {employee_name} for any future role or opportunity
            they choose to pursue. I am confident that they will be a valuable asset to any organization
            and will continue to excel in their professional career. I wish them all the very best in
            their future endeavors.
          </p>

          <p className="lor-closing">
            Should you require any further information, please do not hesitate to contact us.
          </p>

          <p className="lor-regards">Warm Regards,</p>
        </div>

        {/* ── Signature & Seal ── */}
        <div className="lor-footer">
          <div className="lor-signature-section">
            <div className="lor-signature-block">
              <div className="lor-sig-line"></div>
              <p className="lor-sig-name">Hemalatha</p>
              <p className="lor-sig-title">Founder & CEO, ExaWaves Technology</p>
            </div>
            <div className="lor-seal">
              <div className="lor-seal-circle">
                <img src="/ExaWaves Logo.svg" alt="Company Seal" />
              </div>
              <p className="lor-seal-text">Official Seal</p>
            </div>
          </div>
        </div>

        {/* ── Bottom Section ── */}
        <div className="lor-bottom-section">
          <div className="lor-bottom-divider"></div>
          <div className="lor-bottom-info">
            <p>© {new Date().getFullYear()} ExaWaves Technology. All rights reserved.</p>
            <p>
              <a href="mailto:exawaves@gmail.com">exawaves@gmail.com</a> &nbsp;|&nbsp; www.exawaves.com
            </p>
          </div>
        </div>
      </div>

      {/* Bottom color bar */}
      <div className="lor-bottom-bar"></div>
    </div>
  );
});

RecommendationLetterTemplate.displayName = 'RecommendationLetterTemplate';

export default RecommendationLetterTemplate;
