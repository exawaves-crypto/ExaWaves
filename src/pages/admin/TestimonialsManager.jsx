import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, RefreshCw } from 'lucide-react';
import './AdminPanels.css';

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    quote: '',
    author: '',
    role: '',
    initial: '',
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      setError('Failed to load testimonials: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ quote: '', author: '', role: '', initial: '' });
    setShowModal(true);
  };

  const openEdit = (testi) => {
    setEditingId(testi.id);
    setForm({
      quote: testi.quote,
      author: testi.author,
      role: testi.role,
      initial: testi.initial,
    });
    setShowModal(true);
  };

  const handleAuthorChange = (value) => {
    setForm({
      ...form,
      author: value,
      initial: value.charAt(0).toUpperCase(),
    });
  };

  const handleSave = async () => {
    if (!form.quote || !form.author || !form.role) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingId) {
        const { error } = await supabase
          .from('testimonials')
          .update(form)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([form]);
        if (error) throw error;
      }

      setShowModal(false);
      fetchTestimonials();
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setDeleteConfirm(null);
      fetchTestimonials();
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="admin-panel">
      <div className="panel-toolbar">
        <div className="panel-info">
          <h3>All Testimonials</h3>
          <span className="badge">{testimonials.length} total</span>
        </div>
        <div className="panel-actions">
          <button className="icon-btn" onClick={fetchTestimonials} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button className="action-btn primary" onClick={openCreate}>
            <Plus size={16} />
            <span>Add New</span>
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
          <p>Loading testimonials...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="panel-empty">
          <p>No testimonials yet. Click "Add New" to create one.</p>
        </div>
      ) : (
        <div className="panel-table-wrapper">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Role</th>
                <th>Quote</th>
                <th style={{width: '100px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((testi) => (
                <tr key={testi.id}>
                  <td>
                    <div className="table-author">
                      <div className="table-avatar">{testi.initial}</div>
                      <span>{testi.author}</span>
                    </div>
                  </td>
                  <td><span className="table-role">{testi.role}</span></td>
                  <td><span className="table-quote">{testi.quote.substring(0, 80)}...</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn edit" onClick={() => openEdit(testi)} title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="icon-btn delete" onClick={() => setDeleteConfirm(testi.id)} title="Delete">
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

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-card small" onClick={e => e.stopPropagation()}>
            <h3>Delete Testimonial?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="action-btn outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="action-btn danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Testimonial' : 'New Testimonial'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label>Author Name *</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => handleAuthorChange(e.target.value)}
                  placeholder="Enter name"
                />
              </div>
              <div className="modal-field">
                <label>Role / Designation *</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Enter role and company"
                />
              </div>
              <div className="modal-field">
                <label>Initial Letter</label>
                <input
                  type="text"
                  value={form.initial}
                  onChange={(e) => setForm({ ...form, initial: e.target.value.charAt(0).toUpperCase() })}
                  placeholder="S"
                  maxLength={1}
                  style={{ width: '80px' }}
                />
              </div>
              <div className="modal-field">
                <label>Testimonial Quote *</label>
                <textarea
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  placeholder="What did they say about ExaWaves?"
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-btn outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="action-btn primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="login-spinner" style={{ width: 16, height: 16 }}></span> : <Save size={16} />}
                <span>{editingId ? 'Update' : 'Create'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;
