import { CalendarX, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import FormateurCard from '../components/FormateurCard';

export default function ClientDashboard() {
  const [tab, setTab] = useState('bookings');
  const [reservations, setReservations] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [search, setSearch] = useState('');

  const loadReservations = () => api.get('/my-reservations').then(({ data }) => setReservations(data));
  const loadFormateurs = () => api.get('/formateurs', { params: { search: search || undefined } }).then(({ data }) => setFormateurs(data));

  useEffect(() => {
    loadReservations();
    loadFormateurs();
  }, []);

  const grouped = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      upcoming: reservations.filter((item) => item.statut === 'confirmee' && item.slot?.date >= today),
      past: reservations.filter((item) => item.statut === 'confirmee' && item.slot?.date < today),
      cancelled: reservations.filter((item) => item.statut === 'annulee'),
    };
  }, [reservations]);

  const cancel = async (id) => {
    await api.delete(`/reservations/${id}`);
    loadReservations();
  };

  return (
    <main className="page">
      <section className="toolbar">
        <div>
          <h1>Client dashboard</h1>
          <p>Manage bookings and discover verified formateurs.</p>
        </div>
        <div className="tabs">
          <button className={tab === 'bookings' ? 'active' : ''} onClick={() => setTab('bookings')} type="button">My bookings</button>
          <button className={tab === 'browse' ? 'active' : ''} onClick={() => setTab('browse')} type="button">Browse formateurs</button>
        </div>
      </section>

      {tab === 'bookings' && (
        <section className="panel">
          {['upcoming', 'past', 'cancelled'].map((group) => (
            <div className="booking-group" key={group}>
              <h2>{group}</h2>
              {grouped[group].map((reservation) => (
                <article className="slot-card" key={reservation.reservation_id}>
                  <div>
                    <strong>{reservation.formateur?.name}</strong>
                    <span>Date: {reservation.slot?.date.split('T')[0]}</span>
                    <span>Time: {reservation.slot?.start_time?.slice(0, 5)} - {reservation.slot?.end_time?.slice(0, 5)}</span>
                    <span>Hourly Rate: {reservation.formateur?.hourly_rate} $</span>
                    {reservation.meeting_url ? (
                      <span>
                        <strong>Meeting:</strong>
                        <a href={reservation.meeting_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0f6f48', wordBreak: 'break-all' }}>
                          {reservation.meeting_url}
                        </a>
                      </span>
                    ) : (
                      <span className="muted">Meeting link not available yet</span>
                    )}
                  </div>
                  <div>
                    <span className="chip">{reservation.statut}</span>
                    {group === 'upcoming' && (
                      <button className="icon-text danger" type="button" onClick={() => cancel(reservation.reservation_id)}>
                        <CalendarX size={17} />Cancel
                      </button>
                    )}
                  </div>
                </article>
              ))}
              {!grouped[group].length && <p className="muted">No {group} bookings.</p>}
            </div>
          ))}
        </section>
      )}

      {tab === 'browse' && (
        <section>
          <form className="search-row compact" onSubmit={(event) => { event.preventDefault(); loadFormateurs(); }}>
            <label className="input-with-icon"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by formateur or language..." /></label>
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
          <div className="grid-list">
            {formateurs.map((formateur) => <FormateurCard key={formateur.id} formateur={formateur} />)}
          </div>
        </section>
      )}
    </main>
  );
}
