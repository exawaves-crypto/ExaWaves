import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Plus, X, Save, AlertCircle, RefreshCw, Search, Edit, Trash2,
  Zap, CheckCircle, Upload, User, Eye, Award, ScrollText, FileHeart, Image, Link
} from 'lucide-react';
import './AdminPanels.css';

const CandidateManager = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [generating, setGenerating] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrlMode, setPhotoUrlMode] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const emptyForm = {
    full_name: '',
    email: '',
    intern_role: '',
    department: '',
    training_partner: '',
    start_date: '',
    end_date: '',
    duration: '',
    projects: '',
    project_descriptions: '',
    skills: '',
    performance_summary: '',
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      setError('Failed to load candidates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `photos/${fileName}`;
    const { error } = await supabase.storage
      .from('candidate-photos')
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from('candidate-photos')
      .getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB');
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoUrl = () => {
    const url = photoUrlInput.trim();
    if (!url) return;
    setPhotoPreview(url);
    setPhotoFile(null);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.intern_role || !form.department ||
        !form.training_partner || !form.start_date || !form.end_date || !form.duration) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let photoUrl = photoPreview && !photoFile ? photoPreview : null;
      if (photoFile) {
        setUploadingPhoto(true);
        photoUrl = await uploadPhoto(photoFile);
        setUploadingPhoto(false);
      }

      const projectsArray = form.projects && typeof form.projects === 'string'
        ? form.projects.split(',').map(p => p.trim()).filter(Boolean) : [];
      const skillsArray = form.skills && typeof form.skills === 'string'
        ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

      const payload = {
        full_name: form.full_name,
        email: form.email,
        intern_role: form.intern_role,
        department: form.department,
        training_partner: form.training_partner,
        start_date: form.start_date,
        end_date: form.end_date,
        duration: form.duration,
        projects: projectsArray,
        project_descriptions: form.project_descriptions,
        skills: skillsArray,
        performance_summary: form.performance_summary,
      };
      if (photoUrl) payload.photo_url = photoUrl;

      if (editId) {
        const { error } = await supabase.from('candidates').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('candidates').insert([payload]);
        if (error) throw error;
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      setPhotoFile(null);
      setPhotoUrlMode(false);
      setPhotoUrlInput('');
      setPhotoPreview(null);
      fetchCandidates();
    } catch (err) {
      setError(`Failed to ${editId ? 'update' : 'add'} candidate: ` + err.message);
    } finally {
      setSaving(false);
      setUploadingPhoto(false);
    }
  };

  const handleEditClick = (c) => {
    setForm({
      full_name: c.full_name || '',
      email: c.email || '',
      intern_role: c.intern_role || '',
      department: c.department || '',
      training_partner: c.training_partner || '',
      start_date: c.start_date || '',
      end_date: c.end_date || '',
      duration: c.duration || '',
      projects: Array.isArray(c.projects) ? c.projects.join(', ') : '',
      project_descriptions: c.project_descriptions || '',
      skills: Array.isArray(c.skills) ? c.skills.join(', ') : '',
      performance_summary: c.performance_summary || '',
    });
    setPhotoPreview(c.photo_url || null);
    setPhotoFile(null);
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate and their linked documents?')) return;
    try {
      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (error) throw error;
      fetchCandidates();
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  const generateAll = async (candidate) => {
    setGenerating(candidate.id);
    setError('');
    try {
      const year = new Date().getFullYear();
      const ts = Date.now().toString().slice(-4);

      // 1. Certificate
      const certNum = `EXA-${year}-${ts}`;
      const { data: cert, error: certErr } = await supabase.from('certificates').insert([{
        certificate_number: certNum,
        student_name: candidate.full_name,
        email: candidate.email,
        intern_role: candidate.intern_role,
        training_partner: candidate.training_partner,
        start_date: candidate.start_date,
        end_date: candidate.end_date,
        duration: candidate.duration,
        projects: candidate.projects || [],
        project_descriptions: candidate.project_descriptions,
        photo_url: candidate.photo_url || null,
        candidate_id: candidate.id,
      }]).select().single();
      if (certErr) throw new Error('Certificate: ' + certErr.message);

      // 2. Patent Letter
      const patentNum = `EXA-PT-${year}-${ts}`;
      const { data: patent, error: patErr } = await supabase.from('patent_letters').insert([{
        patent_number: patentNum,
        student_name: candidate.full_name,
        email: candidate.email,
        intern_role: candidate.intern_role,
        training_partner: candidate.training_partner,
        start_date: candidate.start_date,
        end_date: candidate.end_date,
        duration: candidate.duration,
        projects: candidate.projects || [],
        project_descriptions: candidate.project_descriptions,
        candidate_id: candidate.id,
      }]).select().single();
      if (patErr) throw new Error('Patent: ' + patErr.message);

      // 3. Recommendation Letter
      const refNum = `EXA-LOR-${year}-${ts}`;
      const { data: rec, error: recErr } = await supabase.from('recommendation_letters').insert([{
        ref_number: refNum,
        employee_name: candidate.full_name,
        email: candidate.email,
        designation: candidate.intern_role,
        department: candidate.department,
        date_of_joining: candidate.start_date,
        date_of_leaving: candidate.end_date,
        duration: candidate.duration,
        skills: candidate.skills || [],
        performance_summary: candidate.performance_summary,
        candidate_id: candidate.id,
      }]).select().single();
      if (recErr) throw new Error('Recommendation: ' + recErr.message);

      // 4. Update candidate with references
      await supabase.from('candidates').update({
        certificate_id: cert.id,
        patent_id: patent.id,
        recommendation_id: rec.id,
        generation_status: 'generated',
      }).eq('id', candidate.id);

      setSuccessModal({
        name: candidate.full_name,
        certNum,
        patentNum,
        refNum,
      });
      fetchCandidates();
    } catch (err) {
      setError('Generation failed: ' + err.message);
    } finally {
      setGenerating(null);
    }
  };

  const filtered = candidates.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <div className="panel-toolbar">
        <div className="panel-info">
          <h3>All Candidates</h3>
          <span className="badge">{candidates.length} registered</span>
        </div>
        <div className="panel-actions">
          <div className="search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="icon-btn" onClick={fetchCandidates} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button className="action-btn primary" onClick={() => {
            setEditId(null); setForm(emptyForm); setPhotoFile(null); setPhotoPreview(null); setPhotoUrlMode(false); setPhotoUrlInput(''); setShowForm(true);
          }}>
            <Plus size={16} />
            <span>Add Candidate</span>
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
          <p>Loading candidates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel-empty">
          <p>{searchQuery ? 'No candidates match.' : 'No candidates yet. Click "Add Candidate" to get started.'}</p>
        </div>
      ) : (
        <div className="panel-table-wrapper">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Duration</th>
                <th>Status</th>
                <th style={{width: '160px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.photo_url ? (
                      <img src={c.photo_url} alt="" style={{
                        width: 36, height: 36, borderRadius: 8, objectFit: 'cover',
                        border: '2px solid rgba(197,75,140,0.3)'
                      }} />
                    ) : (
                      <div className="table-avatar"><User size={16} /></div>
                    )}
                  </td>
                  <td style={{ color: 'white', fontWeight: 500 }}>{c.full_name}</td>
                  <td><span className="table-role">{c.intern_role}</span></td>
                  <td><span className="table-role">{c.department}</span></td>
                  <td><span className="table-role">{c.duration}</span></td>
                  <td>
                    <span className={`table-status ${c.generation_status === 'generated' ? 'valid' : 'revoked'}`}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: c.generation_status === 'generated' ? '#4ade80' : '#facc15',
                        display: 'inline-block'
                      }}></span>
                      {c.generation_status === 'generated' ? 'Generated' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {c.generation_status !== 'generated' && (
                        <button
                          className="action-btn primary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => generateAll(c)}
                          disabled={generating === c.id}
                          title="Generate All Documents"
                        >
                          {generating === c.id ? (
                            <span className="login-spinner" style={{ width: 14, height: 14 }}></span>
                          ) : <Zap size={13} />}
                          <span>{generating === c.id ? '' : 'Generate'}</span>
                        </button>
                      )}
                      {c.generation_status === 'generated' && (
                        <button className="icon-btn edit" title="All documents generated" style={{cursor:'default'}}>
                          <CheckCircle size={16} style={{color: '#4ade80'}} />
                        </button>
                      )}
                      <button className="icon-btn edit" onClick={() => handleEditClick(c)} title="Edit">
                        <Edit size={14} />
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(c.id)} title="Delete">
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

      {/* Add / Edit Candidate Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Candidate' : 'Add New Candidate'}</h3>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {/* Photo Upload */}
              <div className="cert-form-section">
                <h4>Passport Photo</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{
                    width: 100, height: 120, borderRadius: 12,
                    border: '2px dashed rgba(197,75,140,0.3)',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0,
                  }}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Image size={28} style={{ color: 'rgba(255,255,255,0.15)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      <button
                        type="button"
                        className={`action-btn ${!photoUrlMode ? 'primary' : 'outline'}`}
                        style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                        onClick={() => setPhotoUrlMode(false)}
                      >
                        <Upload size={13} />
                        <span>File Upload</span>
                      </button>
                      <button
                        type="button"
                        className={`action-btn ${photoUrlMode ? 'primary' : 'outline'}`}
                        style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                        onClick={() => setPhotoUrlMode(true)}
                      >
                        <Link size={13} />
                        <span>Paste URL</span>
                      </button>
                    </div>
                    {!photoUrlMode ? (
                      <>
                        <label htmlFor="photo-upload" className="action-btn outline" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                          <Upload size={14} />
                          <span>{photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
                        </label>
                        <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                      </>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="url"
                          value={photoUrlInput}
                          onChange={(e) => setPhotoUrlInput(e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          style={{ flex: 1, fontSize: '0.85rem' }}
                        />
                        <button type="button" className="action-btn primary" style={{ padding: '5px 14px', fontSize: '0.75rem', whiteSpace: 'nowrap' }} onClick={handlePhotoUrl}>
                          <span>Load</span>
                        </button>
                      </div>
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
                      {photoUrlMode ? 'Paste a direct image URL' : 'Passport-size photo, max 5MB'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="cert-form-section">
                <h4>Personal Information</h4>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Full Name *</label>
                    <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Enter full name" />
                  </div>
                  <div className="modal-field">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email" />
                  </div>
                </div>
              </div>

              {/* Internship Details */}
              <div className="cert-form-section">
                <h4>Internship Details</h4>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Intern Role / Designation *</label>
                    <input type="text" value={form.intern_role} onChange={(e) => setForm({ ...form, intern_role: e.target.value })} placeholder="e.g. Frontend Developer Intern" />
                  </div>
                  <div className="modal-field">
                    <label>Department *</label>
                    <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" />
                  </div>
                </div>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Training Partner / Mentor *</label>
                    <input type="text" value={form.training_partner} onChange={(e) => setForm({ ...form, training_partner: e.target.value })} placeholder="Mentor name" />
                  </div>
                  <div className="modal-field">
                    <label>Duration *</label>
                    <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 3 Months" />
                  </div>
                </div>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Start Date *</label>
                    <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div className="modal-field">
                    <label>End Date *</label>
                    <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div className="cert-form-section">
                <h4>Projects</h4>
                <div className="modal-field">
                  <label>Project Names (comma-separated)</label>
                  <input type="text" value={form.projects} onChange={(e) => setForm({ ...form, projects: e.target.value })} placeholder="e.g. E-Commerce Platform, Dashboard UI" />
                </div>
                <div className="modal-field">
                  <label>Project Descriptions</label>
                  <textarea value={form.project_descriptions} onChange={(e) => setForm({ ...form, project_descriptions: e.target.value })} placeholder="Brief description of work..." rows={3} />
                </div>
              </div>

              {/* Skills & Performance */}
              <div className="cert-form-section">
                <h4>Skills & Performance (for Recommendation Letter)</h4>
                <div className="modal-field">
                  <label>Key Skills (comma-separated)</label>
                  <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. React, Node.js, Team Leadership" />
                </div>
                <div className="modal-field">
                  <label>Performance Summary</label>
                  <textarea value={form.performance_summary} onChange={(e) => setForm({ ...form, performance_summary: e.target.value })} placeholder="Highlight achievements..." rows={3} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-btn outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="action-btn primary" onClick={handleSave} disabled={saving || uploadingPhoto}>
                {saving ? <span className="login-spinner" style={{ width: 16, height: 16 }}></span> : <Save size={16} />}
                <span>{uploadingPhoto ? 'Uploading Photo...' : editId ? 'Update Candidate' : 'Save Candidate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="modal-overlay" onClick={() => setSuccessModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>✨ All Documents Generated!</h3>
              <button className="icon-btn" onClick={() => setSuccessModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle size={32} style={{ color: '#4ade80' }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24, fontSize: '0.95rem' }}>
                All 3 documents for <strong style={{color:'white'}}>{successModal.name}</strong> have been created successfully!
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                <div style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <Award size={18} style={{ color: '#c084fc' }} />
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Certificate</p>
                    <p style={{ fontSize: '0.9rem', color: 'white', margin: 0, fontWeight: 500 }}>{successModal.certNum}</p>
                  </div>
                </div>
                <div style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <ScrollText size={18} style={{ color: '#d4a574' }} />
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Patent Letter</p>
                    <p style={{ fontSize: '0.9rem', color: 'white', margin: 0, fontWeight: 500 }}>{successModal.patentNum}</p>
                  </div>
                </div>
                <div style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <FileHeart size={18} style={{ color: '#C54B8C' }} />
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Recommendation Letter</p>
                    <p style={{ fontSize: '0.9rem', color: 'white', margin: 0, fontWeight: 500 }}>{successModal.refNum}</p>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: 20 }}>
                View each document from its respective tab to preview, download, or email.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="action-btn primary" onClick={() => setSuccessModal(null)}>
                <CheckCircle size={16} />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateManager;
