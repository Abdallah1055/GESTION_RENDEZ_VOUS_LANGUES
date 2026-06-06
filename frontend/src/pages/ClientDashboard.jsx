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
      upcoming: reservations.filter((item) => item.statut === 'confirmee' && item.time_slot?.date >= today),
      past: reservations.filter((item) => item.statut === 'confirmee' && item.time_slot?.date < today),
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
                <article className="booking-row" key={reservation.id}>
                  <div>
                    <strong>{reservation.time_slot?.formateur?.name}</strong>
                    <span>{reservation.time_slot?.date} at {reservation.time_slot?.heure_debut?.slice(0, 5)}</span>
                  </div>
                  <span className="chip">{reservation.statut}</span>
                  {group === 'upcoming' && (
                    <button className="icon-text danger" type="button" onClick={() => cancel(reservation.id)}>
                      <CalendarX size={17} />Cancel
                    </button>
                  )}
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
            <label className="input-with-icon"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" /></label>
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
