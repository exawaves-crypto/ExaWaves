import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, AlertCircle, RefreshCw, Download, Eye, Ban, Search, Mail, Edit, Trash2 } from 'lucide-react';
import CertificateTemplate from '../../components/CertificateTemplate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './AdminPanels.css';

const CertificateManager = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const certRef = useRef(null);

  const emptyForm = {
    student_name: '',
    email: '',
    intern_role: '',
    training_partner: '',
    start_date: '',
    end_date: '',
    duration: '',
    projects: '',
    project_descriptions: '',
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCertificates(data || []);
    } catch (err) {
      setError('Failed to load certificates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCertNumber = () => {
    const year = new Date().getFullYear();
    const num = String(certificates.length + 1).padStart(4, '0');
    return `EXA-${year}-${num}`;
  };

  const handleSave = async () => {
    if (!form.student_name || !form.intern_role || !form.training_partner || !form.start_date || !form.end_date || !form.duration) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const projectsArray = form.projects && typeof form.projects === 'string'
        ? form.projects.split(',').map(p => p.trim()).filter(Boolean)
        : Array.isArray(form.projects) ? form.projects : [];

      let data, error;

      if (editId) {
        // Update existing certificate
        const response = await supabase
          .from('certificates')
          .update({
            student_name: form.student_name,
            email: form.email,
            intern_role: form.intern_role,
            training_partner: form.training_partner,
            start_date: form.start_date,
            end_date: form.end_date,
            duration: form.duration,
            projects: projectsArray,
            project_descriptions: form.project_descriptions,
          })
          .eq('id', editId)
          .select()
          .single();
        data = response.data;
        error = response.error;
      } else {
        // Create new certificate
        const certNumber = generateCertNumber();
        const response = await supabase
          .from('certificates')
          .insert([{
            certificate_number: certNumber,
            student_name: form.student_name,
            email: form.email,
            intern_role: form.intern_role,
            training_partner: form.training_partner,
            start_date: form.start_date,
            end_date: form.end_date,
            duration: form.duration,
            projects: projectsArray,
            project_descriptions: form.project_descriptions,
          }])
          .select()
          .single();
        data = response.data;
        error = response.error;
      }

      if (error) throw error;

      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchCertificates();
      setShowPreview(data);
    } catch (err) {
      setError(`Failed to ${editId ? 'update' : 'create'} certificate: ` + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (cert) => {
    setForm({
      student_name: cert.student_name || '',
      email: cert.email || '',
      intern_role: cert.intern_role || '',
      training_partner: cert.training_partner || '',
      start_date: cert.start_date || '',
      end_date: cert.end_date || '',
      duration: cert.duration || '',
      projects: Array.isArray(cert.projects) ? cert.projects.join(', ') : (cert.projects || ''),
      project_descriptions: cert.project_descriptions || '',
    });
    setEditId(cert.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this certificate? This action cannot be undone.")) return;
    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchCertificates();
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  const handleRevoke = async (id) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ status: 'revoked' })
        .eq('id', id);
      if (error) throw error;
      fetchCertificates();
    } catch (err) {
      setError('Revoke failed: ' + err.message);
    }
  };

  const generatePDF = async () => {
    if (!certRef.current) return null;
    const canvas = await html2canvas(certRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const pdf = await generatePDF();
      if (pdf) pdf.save(`Certificate-${showPreview.certificate_number}.pdf`);
    } catch (err) {
      setError('PDF download failed: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!showPreview?.email) {
      setError('No email address found for this student. Please add an email when creating the certificate.');
      return;
    }
    if (!certRef.current) return;
    setSending(true);
    setSendSuccess('');
    setError('');
    try {
      // Generate a lighter PDF for email (scale 1 instead of 2)
      const canvas = await html2canvas(certRef.current, {
        scale: 1,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const pdfBase64 = pdf.output('datauristring').split(',')[1];

      const res = await fetch('http://localhost:3001/api/send-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: showPreview.email,
          studentName: showPreview.student_name,
          certificateNumber: showPreview.certificate_number,
          pdfBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      setSendSuccess(`Certificate sent to ${showPreview.email}`);
      setTimeout(() => setSendSuccess(''), 5000);
    } catch (err) {
      setError('Email failed: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const filteredCerts = certificates.filter(c =>
    c.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.certificate_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <div className="panel-toolbar">
        <div className="panel-info">
          <h3>All Certificates</h3>
          <span className="badge">{certificates.length} issued</span>
        </div>
        <div className="panel-actions">
          <div className="search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="icon-btn" onClick={fetchCertificates} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button className="action-btn primary" onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }}>
            <Plus size={16} />
            <span>Generate New</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="panel-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      {loading ? (
        <div className="panel-loading">
          <div className="admin-loader"></div>
          <p>Loading certificates...</p>
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="panel-empty">
          <p>{searchQuery ? 'No certificates match your search.' : 'No certificates yet. Click "Generate New" to create one.'}</p>
        </div>
      ) : (
        <div className="panel-table-wrapper">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Certificate #</th>
                <th>Student Name</th>
                <th>Role</th>
                <th>Duration</th>
                <th>Status</th>
                <th style={{width: '120px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCerts.map((cert) => (
                <tr key={cert.id}>
                  <td><code style={{ color: '#c084fc', fontSize: '0.8rem' }}>{cert.certificate_number}</code></td>
                  <td style={{ color: 'white', fontWeight: 500 }}>{cert.student_name}</td>
                  <td><span className="table-role">{cert.intern_role}</span></td>
                  <td><span className="table-role">{cert.duration}</span></td>
                  <td>
                    <span className={`table-status ${cert.status}`}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: cert.status === 'valid' ? '#4ade80' : '#f87171',
                        display: 'inline-block'
                      }}></span>
                      {cert.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn edit" onClick={() => setShowPreview(cert)} title="Preview">
                        <Eye size={14} />
                      </button>
                      <button className="icon-btn edit" onClick={() => handleEditClick(cert)} title="Edit">
                        <Edit size={14} />
                      </button>
                      {cert.status === 'valid' && (
                        <button className="icon-btn delete" onClick={() => handleRevoke(cert.id)} title="Revoke">
                          <Ban size={14} />
                        </button>
                      )}
                      <button className="icon-btn delete" onClick={() => handleDelete(cert.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate New Certificate Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Certificate' : 'Generate New Certificate'}</h3>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            <div className="modal-body">
              <div className="cert-form-section">
                <h4>Student Information</h4>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={form.student_name}
                      onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="modal-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Enter email"
                    />
                  </div>
                </div>
              </div>

              <div className="cert-form-section">
                <h4>Internship Details</h4>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Intern Role *</label>
                    <input
                      type="text"
                      value={form.intern_role}
                      onChange={(e) => setForm({ ...form, intern_role: e.target.value })}
                      placeholder="e.g. Frontend Developer Intern"
                    />
                  </div>
                </div>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Training Partner *</label>
                    <input
                      type="text"
                      value={form.training_partner}
                      onChange={(e) => setForm({ ...form, training_partner: e.target.value })}
                      placeholder="Mentor/partner name"
                    />
                  </div>
                  <div className="modal-field">
                    <label>Duration *</label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      placeholder="e.g. 3 Months"
                    />
                  </div>
                </div>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    />
                  </div>
                  <div className="modal-field">
                    <label>End Date *</label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="cert-form-section">
                <h4>Projects</h4>
                <div className="modal-field">
                  <label>Project Names (comma-separated)</label>
                  <input
                    type="text"
                    value={form.projects}
                    onChange={(e) => setForm({ ...form, projects: e.target.value })}
                    placeholder="e.g. E-Commerce Platform, Dashboard UI"
                  />
                </div>
                <div className="modal-field">
                  <label>Project Descriptions</label>
                  <textarea
                    value={form.project_descriptions}
                    onChange={(e) => setForm({ ...form, project_descriptions: e.target.value })}
                    placeholder="Brief description of work performed..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-btn outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="action-btn primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="login-spinner" style={{ width: 16, height: 16 }}></span> : <Save size={16} />}
                <span>{editId ? 'Update Certificate' : 'Generate Certificate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(null)}>
          <div className="modal-card large" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', background: '#111' }}>
            <div className="modal-header">
              <h3>Certificate Preview — {showPreview.certificate_number}</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {sendSuccess && <span style={{ color: '#4ade80', fontSize: '0.8rem', marginRight: 4 }}>✓ {sendSuccess}</span>}
                <button className="action-btn" onClick={handleSendEmail} disabled={sending} style={{ background: '#ea4335', color: 'white' }}>
                  <Mail size={14} />
                  <span>{sending ? 'Sending...' : 'Send Email'}</span>
                </button>
                <button className="action-btn success" onClick={handleDownloadPDF} disabled={downloading}>
                  <Download size={14} />
                  <span>{downloading ? 'Generating...' : 'Download PDF'}</span>
                </button>
                <button className="icon-btn" onClick={() => setShowPreview(null)}><X size={18} /></button>
              </div>
            </div>
            <div style={{ padding: '24px', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
              <CertificateTemplate ref={certRef} certificate={showPreview} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Additional style for search box */
const style = document.createElement('style');
style.textContent = `
  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: rgba(255,255,255,0.5);
  }
  .search-box input {
    background: none;
    border: none;
    outline: none;
    color: white;
    font-size: 0.85rem;
    width: 180px;
    font-family: var(--font-body);
  }
  .search-box input::placeholder {
    color: rgba(255,255,255,0.25);
  }
`;
document.head.appendChild(style);

export default CertificateManager;
