import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, AlertCircle, RefreshCw, Download, Eye, Search, Mail, Edit, Trash2 } from 'lucide-react';
import PatentLetterTemplate from '../../components/PatentLetterTemplate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './AdminPanels.css';

const PatentLetterManager = () => {
  const [patents, setPatents] = useState([]);
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
  const patentRef = useRef(null);

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
    fetchPatents();
  }, []);

  const fetchPatents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patent_letters')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPatents(data || []);
    } catch (err) {
      setError('Failed to load patent letters: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePatentNumber = () => {
    const year = new Date().getFullYear();
    const num = String(patents.length + 1).padStart(4, '0');
    return `EXA-PT-${year}-${num}`;
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
        const response = await supabase
          .from('patent_letters')
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
        const patentNumber = generatePatentNumber();
        const response = await supabase
          .from('patent_letters')
          .insert([{
            patent_number: patentNumber,
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
      fetchPatents();
      setShowPreview(data);
    } catch (err) {
      setError(`Failed to ${editId ? 'update' : 'create'} patent letter: ` + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (patent) => {
    setForm({
      student_name: patent.student_name || '',
      email: patent.email || '',
      intern_role: patent.intern_role || '',
      training_partner: patent.training_partner || '',
      start_date: patent.start_date || '',
      end_date: patent.end_date || '',
      duration: patent.duration || '',
      projects: Array.isArray(patent.projects) ? patent.projects.join(', ') : (patent.projects || ''),
      project_descriptions: patent.project_descriptions || '',
    });
    setEditId(patent.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this patent letter? This action cannot be undone.")) return;
    try {
      const { error } = await supabase
        .from('patent_letters')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchPatents();
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  const captureElement = async (el, scale = 2) => {
    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!el || el.offsetWidth === 0 || el.offsetHeight === 0) {
      throw new Error('Template element not ready. Please try again.');
    }
    return await html2canvas(el, {
      scale,
      useCORS: true,
      backgroundColor: '#f5f0e8',
      onclone: (clonedDoc) => {
        // Remove pseudo-elements that cause html2canvas createPattern crash
        const style = clonedDoc.createElement('style');
        style.textContent = `
          .patent-template::before,
          .patent-template::after {
            display: none !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      },
    });
  };

  const handleDownloadPDF = async () => {
    if (!patentRef.current) return;
    setDownloading(true);
    try {
      const canvas = await captureElement(patentRef.current, 2);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Patent-${showPreview.patent_number}.pdf`);
    } catch (err) {
      setError('PDF download failed: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!showPreview?.email) {
      setError('No email address found for this student.');
      return;
    }
    if (!patentRef.current) return;
    setSending(true);
    setSendSuccess('');
    setError('');
    try {
      const canvas = await captureElement(patentRef.current, 1);
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const pdfBase64 = pdf.output('datauristring').split(',')[1];

      const res = await fetch('http://localhost:3001/api/send-patent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: showPreview.email,
          studentName: showPreview.student_name,
          patentNumber: showPreview.patent_number,
          pdfBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      setSendSuccess(`Patent letter sent to ${showPreview.email}`);
      setTimeout(() => setSendSuccess(''), 5000);
    } catch (err) {
      setError('Email failed: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const filteredPatents = patents.filter(p =>
    p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patent_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <div className="panel-toolbar">
        <div className="panel-info">
          <h3>All Patent Letters</h3>
          <span className="badge">{patents.length} issued</span>
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
          <button className="icon-btn" onClick={fetchPatents} title="Refresh">
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
          <p>Loading patent letters...</p>
        </div>
      ) : filteredPatents.length === 0 ? (
        <div className="panel-empty">
          <p>{searchQuery ? 'No patent letters match your search.' : 'No patent letters yet. Click "Generate New" to create one.'}</p>
        </div>
      ) : (
        <div className="panel-table-wrapper">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Patent #</th>
                <th>Student Name</th>
                <th>Role</th>
                <th>Projects</th>
                <th>Duration</th>
                <th style={{width: '140px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatents.map((patent) => (
                <tr key={patent.id}>
                  <td><code style={{ color: '#d4a574', fontSize: '0.8rem' }}>{patent.patent_number}</code></td>
                  <td style={{ color: 'white', fontWeight: 500 }}>{patent.student_name}</td>
                  <td><span className="table-role">{patent.intern_role}</span></td>
                  <td><span className="table-role">{Array.isArray(patent.projects) ? patent.projects.join(', ') : '—'}</span></td>
                  <td><span className="table-role">{patent.duration}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn edit" onClick={() => setShowPreview(patent)} title="Preview">
                        <Eye size={14} />
                      </button>
                      <button className="icon-btn edit" onClick={() => handleEditClick(patent)} title="Edit">
                        <Edit size={14} />
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(patent.id)} title="Delete">
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

      {/* Generate / Edit Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Patent Letter' : 'Generate New Patent Letter'}</h3>
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
                <h4>Projects Covered</h4>
                <div className="modal-field">
                  <label>Project Names (comma-separated) *</label>
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
                    placeholder="Brief description of projects and scope of work..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-btn outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="action-btn primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="login-spinner" style={{ width: 16, height: 16 }}></span> : <Save size={16} />}
                <span>{editId ? 'Update Patent Letter' : 'Generate Patent Letter'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patent Letter Preview */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(null)}>
          <div className="modal-card large" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', background: '#111' }}>
            <div className="modal-header">
              <h3>Patent Letter Preview — {showPreview.patent_number}</h3>
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
              <PatentLetterTemplate ref={patentRef} patent={showPreview} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatentLetterManager;
