import { Eye, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function FormateurDashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [slots, setSlots] = useState([]);
  const [students, setStudents] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [slotForm, setSlotForm] = useState({ date: '', heure_debut: '', heure_fin: '' });
  const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [languageId, setLanguageId] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const [slotData, studentData, languageData, me] = await Promise.all([
      api.get(`/time-slots/${user.id}`),
      api.get('/my-students'),
      api.get('/langues'),
      api.get('/me'),
    ]);
    setSlots(slotData.data);
    setStudents(studentData.data);
    setLanguages(languageData.data);
    setUser(me.data);
    setProfile({ name: me.data.name, bio: me.data.bio || '' });
  }, [user.id, setUser]);

  useEffect(() => {
    if (user?.is_verified) {
      load();
    }
  }, [user, location, load]);

  if (!user?.is_verified) {
    return (
      <main className="page">
        <section className="panel">
          <h1>Verification pending</h1>
          <p>Your formateur account is waiting for admin approval. You will be able to manage lessons after verification.</p>
        </section>
      </main>
    );
  }

  const createSlot = async (event) => {
    event.preventDefault();
    await api.post('/time-slots', slotForm);
    setSlotForm({ date: '', heure_debut: '', heure_fin: '' });
    load();
  };

  const updateProfile = async (event) => {
    event.preventDefault();
    const { data } = await api.put('/profile', profile);
    setUser(data);
    setMessage('Profile updated.');
  };

  const addLanguage = async () => {
    if (!languageId) return;
    const { data } = await api.post('/add-language', { language_id: languageId });
    setUser(data);
    setLanguageId('');
  };

  const removeLanguage = async (id) => {
    const { data } = await api.delete(`/remove-language/${id}`);
    setUser(data);
  };

  return (
    <main className="page dashboard-grid">
      <section className="panel">
        <h1>Formateur dashboard</h1>
        <form className="form-grid" onSubmit={createSlot}>
          <label>Date<input type="date" value={slotForm.date} onChange={(event) => setSlotForm({ ...slotForm, date: event.target.value })} required /></label>
          <label>Start<input type="time" value={slotForm.heure_debut} onChange={(event) => setSlotForm({ ...slotForm, heure_debut: event.target.value })} required /></label>
          <label>End<input type="time" value={slotForm.heure_fin} onChange={(event) => setSlotForm({ ...slotForm, heure_fin: event.target.value })} required /></label>
          <button className="btn btn-primary" type="submit"><Plus size={17} />Add slot</button>
        </form>
        <div className="slot-list">
          {slots.map((slot) => (
            <article className="booking-row" key={slot.id}>
              <div><strong>{slot.date}</strong><span>{slot.heure_debut.slice(0, 5)} - {slot.heure_fin.slice(0, 5)}</span></div>
              <button className="icon-btn danger" type="button" onClick={() => api.delete(`/time-slots/${slot.id}`).then(load)} aria-label="Delete slot"><Trash2 size={17} /></button>
            </article>
          ))}
        </div>
      </section>


      
      <section className="panel">
      <h2>Clients</h2>

      {students.map((student) => (
        <article className="booking-row" key={student.id}>
          <div>
            <strong>{student.name}</strong>
            <span>{student.email}</span>
          </div>

          <button
            className="icon-text"
            type="button"
            onClick={() => {
              const reservationId =
                student.reservations?.[0]?.id;

              if (reservationId) {
                navigate(`/formateur/student-details/${reservationId}`);
              }
            }}
          >
            <Eye size={17} />
            View Details
          </button>
        </article>
      ))}

      {!students.length && (
        <p className="muted">No students yet.</p>
      )}
      </section>
      
      {/* Languages section */}
      <section className="panel">
        <h2>Languages</h2>
        <div className="search-row compact">
          <select value={languageId} onChange={(event) => setLanguageId(event.target.value)}>
            <option value="">Choose language</option>
            {languages.map((language) => <option key={language.id} value={language.id}>{language.nom}</option>)}
          </select>
          <button className="btn btn-primary" type="button" onClick={addLanguage}>Add</button>
        </div>
        <div className="chips">
          {(user.languages || []).map((language) => (
            <button className="chip removable" key={language.id} type="button" onClick={() => removeLanguage(language.id)}>
              {language.nom}<Trash2 size={13} />
            </button>
          ))}
        </div>
      </section>


      {/* Edit profile section */}
      <section className="panel">
        <h2>Edit profile</h2>
        <form className="auth-form" onSubmit={updateProfile}>
          <label>Name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /></label>
          <label>Bio<textarea value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} rows="5" /></label>
          {message && <p className="success">{message}</p>}
          <button className="btn btn-primary" type="submit">Save profile</button>
        </form>
      </section>
    </main>
  );
}
