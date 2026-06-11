import { Check, Eye, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [stats, setStats] = useState({});
  const [newLanguage, setNewLanguage] = useState('');
  const [selectedFormateur, setSelectedFormateur] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [showDetail, setShowDetail] = useState(false);

  const load = async () => {
    const [pendingData, usersData, languageData, statsData] = await Promise.all([
      api.get('/admin/formateurs/pending'),
      api.get('/admin/users'),
      api.get('/langues'),
      api.get('/admin/stats'),
    ]);
    setPending(pendingData.data);
    setUsers(usersData.data);
    setLanguages(languageData.data);
    setStats(statsData.data);
  };

  useEffect(() => {
    load();
  }, []);

  const addLanguage = async (event) => {
    event.preventDefault();
    if (!newLanguage.trim()) return;
    await api.post('/admin/langues', { nom: newLanguage.trim() });
    setNewLanguage('');
    load();
  };

  const viewFormateur = async (id) => {
    const { data } = await api.get(`/admin/formateurs/${id}`);
    console.log("FORMATEUR DATA:", data);
    setSelectedFormateur(data);
    setShowDetail(true);
    setAdminComment('');
  };

  const acceptFormateur = async () => {
    await api.post(`/admin/formateurs/${selectedFormateur.id}/accept`);
    setShowDetail(false);
    setSelectedFormateur(null);
    load();
  };

  const refuseFormateur = async () => {
    await api.post(`/admin/formateurs/${selectedFormateur.id}/refuse`, { admin_comment: adminComment });
    setShowDetail(false);
    setSelectedFormateur(null);
    setAdminComment('');
    load();
  };

  const downloadCertification = async (formateurId, filename) => {
    try {
      const response = await api.get(`/admin/formateurs/${formateurId}/certifications/${filename}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certification:', error);
      alert('Failed to download certification. Please try again.');
    }
  };

  return (
    <main className="page admin-layout">
      <section className="toolbar">
        <div>
          <h1>Admin dashboard</h1>
          <p>Verify formateurs, manage users, languages, and platform metrics.</p>
        </div>
      </section>

      <section className="stats-grid">
        {[
          ['Clients', stats.clients],
          ['Formateurs', stats.formateurs],
          ['Verified', stats.verified],
          ['Bookings', stats.bookings],
        ].map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong>{value ?? 0}</strong></article>)}
      </section>

      <section className="panel">
        <h2>Pending formateurs</h2>
        {pending.map((formateur) => (
          <article className="booking-row" key={formateur.id}>
            <div><strong>{formateur.name}</strong><span>{formateur.email}</span></div>
            <div className="row-actions">
              <button className="icon-text" type="button" onClick={() => viewFormateur(formateur.id)}><Eye size={17} />View</button>
              <button className="icon-text" type="button" onClick={() => api.post(`/admin/formateurs/${formateur.id}/accept`).then(load)}><Check size={17} />Approve</button>
              <button className="icon-text danger" type="button" onClick={() => api.delete(`/admin/users/${formateur.id}`).then(load)}><Trash2 size={17} />Reject</button>
            </div>
          </article>
        ))}
        {!pending.length && <p className="muted">No pending formateurs.</p>}
      </section>

      <section className="panel">
        <h2>Users</h2>
        {users.map((item) => (
          <article className="booking-row" key={item.id}>
            <div><strong>{item.name}</strong><span>{item.email} - {item.role} - {item.status}</span></div>
            {item.role !== 'admin' && <button className="icon-btn danger" type="button" onClick={() => api.delete(`/admin/users/${item.id}`).then(load)} aria-label="Delete user"><Trash2 size={17} /></button>}
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>Languages</h2>
        <form className="search-row compact" onSubmit={addLanguage}>
          <input value={newLanguage} onChange={(event) => setNewLanguage(event.target.value)} placeholder="New language" />
          <button className="btn btn-primary" type="submit"><Plus size={17} />Add</button>
        </form>
        <div className="chips">
          {languages.map((language) => (
            <button className="chip removable" key={language.id} type="button" onClick={() => api.delete(`/admin/langues/${language.id}`).then(load)}>
              {language.nom}<Trash2 size={13} />
            </button>
          ))}
        </div>
      </section>

      {showDetail && selectedFormateur && (
        <div className="modal-backdrop" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn modal-close" onClick={() => setShowDetail(false)}><X size={20} /></button>
            <h2>Formateur Details</h2>
            
            <div className="profile-panel">
              <div className="avatar xl">{selectedFormateur.name.charAt(0).toUpperCase()}</div>
              <div>
                <h3>{selectedFormateur.name}</h3>
                <p className="muted">{selectedFormateur.email}</p>
                <p className="muted">Status: {selectedFormateur.status}</p>
                <p className="muted">Registered: {new Date(selectedFormateur.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedFormateur.role === 'formateur' && (
              <>
                <h3>Formateur Information</h3>
                <div className="card-body">
                  <p><strong>Hourly Rate:</strong> ${selectedFormateur.hourly_rate || 'N/A'}/hour</p>
                  <p><strong>Bio:</strong> {selectedFormateur.bio || 'No bio provided'}</p>
                </div>

                <h3>Languages Taught</h3>
                <div className="chips">
                  {selectedFormateur.languages && selectedFormateur.languages.length > 0 ? (
                    selectedFormateur.languages.map((lang) => (
                      <span className="chip" key={lang.id}>{lang.nom}</span>
                    ))
                  ) : (
                    <p className="muted">No languages specified</p>
                  )}
                </div>

                {selectedFormateur.certifications && (
                  <>
                    <h3>Certifications</h3>
                    <div className="card-body">
                      {(() => {
                        let certifications = selectedFormateur.certifications;
                        let certArray = null;
                        
                        console.log("CERTIFICATIONS RAW:", certifications);
                        
                        try {
                          if (typeof certifications === 'string') {
                            certArray = JSON.parse(certifications);
                          } else if (Array.isArray(certifications)) {
                            certArray = certifications;
                          }
                        } catch (e) {
                          console.error('Error parsing certifications:', e);
                          return <p className="muted">Error loading certifications</p>;
                        }

                        console.log("CERTIFICATIONS PARSED:", certArray);

                        if (!certArray || certArray.length === 0) {
                          return <p className="muted">No certifications uploaded</p>;
                        }

                        return certArray.map((cert, index) => (
                          <button 
                            key={index} 
                            className="chip removable" 
                            type="button"
                            onClick={() => downloadCertification(selectedFormateur.id, cert.original_name)}
                          >
                            📄 {cert.original_name}
                          </button>
                        ));
                      })()}
                    </div>
                  </>
                )}

                {!selectedFormateur.certifications && (
                  <>
                    <h3>Certifications</h3>
                    <p className="muted">No certifications uploaded</p>
                  </>
                )}
              </>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setShowDetail(false)}>Cancel</button>
              <button className="btn btn-primary" type="button" onClick={acceptFormateur}><Check size={17} />Accept</button>
              <button className="btn btn-ghost danger" type="button" onClick={() => { refuseFormateur(); }}><X size={17} />Refuse</button>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Admin Comment (for refusal)</label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Reason for refusal..."
                rows="3"
                style={{ width: '100%', padding: '11px 12px', border: '1px solid #d6ddd7', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
