import React, { forwardRef } from 'react';
import './PatentLetterTemplate.css';

const PatentLetterTemplate = forwardRef(({ patent }, ref) => {
  const {
    patent_number,
    student_name,
    intern_role,
    training_partner,
    start_date,
    end_date,
    duration,
    projects,
    project_descriptions,
    issued_date,
  } = patent;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const projectList = Array.isArray(projects) ? projects : [];

  return (
    <div className="patent-template" ref={ref}>
      <div className="patent-border">
        <div className="patent-inner-border">
          <div className="patent-inner">
            {/* Watermark */}
            <div className="patent-watermark">
              <img src="/ExaWaves Logo.svg" alt="" />
            </div>

            {/* Ornamental Corners */}
            <div className="patent-ornament patent-ornament-tl"></div>
            <div className="patent-ornament patent-ornament-tr"></div>
            <div className="patent-ornament patent-ornament-bl"></div>
            <div className="patent-ornament patent-ornament-br"></div>

            {/* Header */}
            <div className="patent-header">
              <div className="patent-company-logo">
                <img src="/ExaWaves Logo.svg" alt="ExaWaves Technology" />
              </div>
              <h1 className="patent-doc-title">Patent Letter</h1>
              <p className="patent-doc-subtitle">Project Rights & Intellectual Property Grant</p>
            </div>

            {/* Ornamental Rule */}
            <div className="patent-rule">
              <div className="patent-rule-line"></div>
              <span className="patent-rule-diamond">◆</span>
              <div className="patent-rule-line"></div>
            </div>

            {/* Patent Number */}
            <div className="patent-number-section">
              <p className="patent-number-label">Patent Reference Number</p>
              <p className="patent-number-value">{patent_number}</p>
            </div>

            {/* Body */}
            <div className="patent-body">
              <p className="patent-preamble">
                Be it known that <strong>ExaWaves Technology</strong>, a company duly organized and operating
                under the laws of the Republic of India, hereby grants and conveys certain rights, title, and
                interest in and to the project(s) described herein to:
              </p>

              <div className="patent-student-highlight">{student_name}</div>

              <p className="patent-preamble">
                who has successfully completed the <strong>{intern_role}</strong> internship
                under the mentorship of <strong>{training_partner}</strong>, for a duration
                of <strong>{duration}</strong> ({formatDate(start_date)} — {formatDate(end_date)}).
              </p>

              {projectList.length > 0 && (
                <div className="patent-projects-section">
                  <p className="patent-projects-label">Project(s) Covered Under This Patent</p>
                  <p className="patent-projects-names">{projectList.join(' • ')}</p>
                </div>
              )}

              {project_descriptions && (
                <p className="patent-preamble" style={{ fontSize: '0.85rem', color: '#5a4a3f' }}>
                  {project_descriptions}
                </p>
              )}

              <h3 className="patent-rights-title">Rights Granted</h3>

              <ul className="patent-rights-list">
                <li>
                  The Grantee shall have full ownership and intellectual property rights over the source code,
                  design, and documentation produced during the internship project(s) listed above.
                </li>
                <li>
                  The Grantee is permitted to use, modify, reproduce, distribute, and publicly display the
                  project(s) for personal, educational, or commercial purposes without limitation.
                </li>
                <li>
                  ExaWaves Technology retains no proprietary claim over the project(s) and waives any rights
                  to revenue, royalties, or licensing fees arising from the Grantee's use of the work.
                </li>
                <li>
                  This grant is irrevocable and shall remain in full force and effect in perpetuity, unless
                  otherwise agreed upon in writing by both parties.
                </li>
                <li>
                  The Grantee may reference ExaWaves Technology as the SaaS development company under which the project(s) were built, in any portfolio, resume, or publication related to the project(s).
                </li>
              </ul>

              <p className="patent-closing">
                In witness whereof, ExaWaves Technology has caused this Patent Letter to be executed
                by its duly authorized representative on the date set forth below. This document serves as
                an official record of the transfer of project rights and may be used as legal proof of
                ownership by the Grantee.
              </p>
            </div>

            {/* Ornamental Rule */}
            <div className="patent-rule">
              <div className="patent-rule-line"></div>
              <span className="patent-rule-diamond">◆</span>
              <div className="patent-rule-line"></div>
            </div>

            {/* Footer */}
            <div className="patent-footer">
              <div className="patent-signature">
                <div className="patent-sig-line"></div>
                <p className="patent-sig-name">Hemalatha</p>
                <p className="patent-sig-title">Founder & CEO, ExaWaves Technology</p>
              </div>

              <div className="patent-seal">
                <div className="patent-seal-circle">
                  <img src="/ExaWaves Logo.svg" alt="Company Seal" />
                </div>
                <p className="patent-seal-text">Official Seal</p>
              </div>

              <div className="patent-issue-info">
                <p>Issued: <strong>{formatDate(issued_date)}</strong></p>
                <p>Place: <strong>India</strong></p>
              </div>
            </div>

            {/* Bottom ornamental line */}
            <div className="patent-bottom-rule">
              <div className="patent-bottom-rule-line"></div>
              <p className="patent-bottom-text">ExaWaves Technology — Project Rights Patent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PatentLetterTemplate.displayName = 'PatentLetterTemplate';

export default PatentLetterTemplate;
