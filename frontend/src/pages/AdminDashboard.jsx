import { Check, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [stats, setStats] = useState({});
  const [newLanguage, setNewLanguage] = useState('');

  const load = async () => {
    const [pendingData, usersData, languageData, statsData] = await Promise.all([
      api.get('/admin/pending-formateurs'),
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
              <button className="icon-text" type="button" onClick={() => api.put(`/admin/verify-formateur/${formateur.id}`).then(load)}><Check size={17} />Approve</button>
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
            <div><strong>{item.name}</strong><span>{item.email} - {item.role}{item.role === 'formateur' ? ` - ${item.is_verified ? 'verified' : 'pending'}` : ''}</span></div>
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
    </main>
  );
}
