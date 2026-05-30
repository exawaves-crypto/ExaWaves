import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, AlertCircle, RefreshCw, Download, Eye, Search, Mail, Edit, Trash2 } from 'lucide-react';
import RecommendationLetterTemplate from '../../components/RecommendationLetterTemplate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './AdminPanels.css';

const RecommendationLetterManager = () => {
  const [letters, setLetters] = useState([]);
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
  const letterRef = useRef(null);

  const emptyForm = {
    employee_name: '',
    email: '',
    designation: '',
    department: '',
    date_of_joining: '',
    date_of_leaving: '',
    duration: '',
    skills: '',
    performance_summary: '',
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recommendation_letters')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLetters(data || []);
    } catch (err) {
      setError('Failed to load recommendation letters: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRefNumber = () => {
    const year = new Date().getFullYear();
    const num = String(letters.length + 1).padStart(4, '0');
    return `EXA-LOR-${year}-${num}`;
  };

  const handleSave = async () => {
    if (!form.employee_name || !form.designation || !form.department || !form.date_of_joining || !form.date_of_leaving || !form.duration) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const skillsArray = form.skills && typeof form.skills === 'string'
        ? form.skills.split(',').map(s => s.trim()).filter(Boolean)
        : Array.isArray(form.skills) ? form.skills : [];

      let data, error;

      if (editId) {
        const response = await supabase
          .from('recommendation_letters')
          .update({
            employee_name: form.employee_name,
            email: form.email,
            designation: form.designation,
            department: form.department,
            date_of_joining: form.date_of_joining,
            date_of_leaving: form.date_of_leaving,
            duration: form.duration,
            skills: skillsArray,
            performance_summary: form.performance_summary,
          })
          .eq('id', editId)
          .select()
          .single();
        data = response.data;
        error = response.error;
      } else {
        const refNumber = generateRefNumber();
        const response = await supabase
          .from('recommendation_letters')
          .insert([{
            ref_number: refNumber,
            employee_name: form.employee_name,
            email: form.email,
            designation: form.designation,
            department: form.department,
            date_of_joining: form.date_of_joining,
            date_of_leaving: form.date_of_leaving,
            duration: form.duration,
            skills: skillsArray,
            performance_summary: form.performance_summary,
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
      fetchLetters();
      setShowPreview(data);
    } catch (err) {
      setError(`Failed to ${editId ? 'update' : 'create'} recommendation letter: ` + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (letter) => {
    setForm({
      employee_name: letter.employee_name || '',
      email: letter.email || '',
      designation: letter.designation || '',
      department: letter.department || '',
      date_of_joining: letter.date_of_joining || '',
      date_of_leaving: letter.date_of_leaving || '',
      duration: letter.duration || '',
      skills: Array.isArray(letter.skills) ? letter.skills.join(', ') : (letter.skills || ''),
      performance_summary: letter.performance_summary || '',
    });
    setEditId(letter.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this recommendation letter? This action cannot be undone.")) return;
    try {
      const { error } = await supabase
        .from('recommendation_letters')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchLetters();
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
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        // Remove pseudo-elements that can cause html2canvas createPattern crash
        const style = clonedDoc.createElement('style');
        style.textContent = `
          .lor-template::before,
          .lor-template::after,
          .lor-letterhead::after,
          .lor-title::before,
          .lor-title::after {
            display: none !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      },
    });
  };

  const handleDownloadPDF = async () => {
    if (!letterRef.current) return;
    setDownloading(true);
    try {
      const canvas = await captureElement(letterRef.current, 2);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Recommendation-${showPreview.ref_number}.pdf`);
    } catch (err) {
      setError('PDF download failed: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!showPreview?.email) {
      setError('No email address found for this person.');
      return;
    }
    if (!letterRef.current) return;
    setSending(true);
    setSendSuccess('');
    setError('');
    try {
      const canvas = await captureElement(letterRef.current, 1);
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const pdfBase64 = pdf.output('datauristring').split(',')[1];

      const res = await fetch('http://localhost:3001/api/send-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: showPreview.email,
          employeeName: showPreview.employee_name,
          refNumber: showPreview.ref_number,
          pdfBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      setSendSuccess(`Recommendation letter sent to ${showPreview.email}`);
      setTimeout(() => setSendSuccess(''), 5000);
    } catch (err) {
      setError('Email failed: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const filteredLetters = letters.filter(l =>
    l.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.ref_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <div className="panel-toolbar">
        <div className="panel-info">
          <h3>All Recommendation Letters</h3>
          <span className="badge">{letters.length} issued</span>
        </div>
        <div className="panel-actions">
          <div className="search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by name or ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="icon-btn" onClick={fetchLetters} title="Refresh">
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
          <p>Loading recommendation letters...</p>
        </div>
      ) : filteredLetters.length === 0 ? (
        <div className="panel-empty">
          <p>{searchQuery ? 'No recommendation letters match your search.' : 'No recommendation letters yet. Click "Generate New" to create one.'}</p>
        </div>
      ) : (
        <div className="panel-table-wrapper">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Ref #</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Duration</th>
                <th style={{width: '140px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLetters.map((letter) => (
                <tr key={letter.id}>
                  <td><code style={{ color: '#C54B8C', fontSize: '0.8rem' }}>{letter.ref_number}</code></td>
                  <td style={{ color: 'white', fontWeight: 500 }}>{letter.employee_name}</td>
                  <td><span className="table-role">{letter.designation}</span></td>
                  <td><span className="table-role">{letter.department}</span></td>
                  <td><span className="table-role">{letter.duration}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn edit" onClick={() => setShowPreview(letter)} title="Preview">
                        <Eye size={14} />
                      </button>
                      <button className="icon-btn edit" onClick={() => handleEditClick(letter)} title="Edit">
                        <Edit size={14} />
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(letter.id)} title="Delete">
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
              <h3>{editId ? 'Edit Recommendation Letter' : 'Generate New Recommendation Letter'}</h3>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            <div className="modal-body">
              <div className="cert-form-section">
                <h4>Personal Information</h4>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={form.employee_name}
                      onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="modal-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              <div className="cert-form-section">
                <h4>Employment Details</h4>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Designation / Role *</label>
                    <input
                      type="text"
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      placeholder="e.g. Senior Frontend Developer"
                    />
                  </div>
                  <div className="modal-field">
                    <label>Department *</label>
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      placeholder="e.g. Engineering, Design, Marketing"
                    />
                  </div>
                </div>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Duration *</label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      placeholder="e.g. 6 Months"
                    />
                  </div>
                </div>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Date of Joining *</label>
                    <input
                      type="date"
                      value={form.date_of_joining}
                      onChange={(e) => setForm({ ...form, date_of_joining: e.target.value })}
                    />
                  </div>
                  <div className="modal-field">
                    <label>Date of Leaving *</label>
                    <input
                      type="date"
                      value={form.date_of_leaving}
                      onChange={(e) => setForm({ ...form, date_of_leaving: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="cert-form-section">
                <h4>Skills & Performance</h4>
                <div className="modal-field">
                  <label>Key Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="e.g. React, Node.js, UI/UX Design, Team Leadership"
                  />
                </div>
                <div className="modal-field">
                  <label>Performance Summary (Optional)</label>
                  <textarea
                    value={form.performance_summary}
                    onChange={(e) => setForm({ ...form, performance_summary: e.target.value })}
                    placeholder="Highlight specific achievements, contributions, or notable performance during their tenure..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-btn outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="action-btn primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="login-spinner" style={{ width: 16, height: 16 }}></span> : <Save size={16} />}
                <span>{editId ? 'Update Letter' : 'Generate Letter'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Letter Preview */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(null)}>
          <div className="modal-card large" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', background: '#111' }}>
            <div className="modal-header">
              <h3>Recommendation Letter — {showPreview.ref_number}</h3>
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
              <RecommendationLetterTemplate ref={letterRef} letter={showPreview} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationLetterManager;
