import { Languages, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import BookingModal from '../components/BookingModal';
import TimeSlotCard from '../components/TimeSlotCard';
import { useAuth } from '../context/AuthContext';

export default function FormateurDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [formateur, setFormateur] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const load = async () => {
    const [profile, slotList] = await Promise.all([
      api.get(`/formateurs/${id}`),
      api.get(`/time-slots/${id}`),
    ]);
    setFormateur(profile.data);
    setSlots(slotList.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!formateur) {
    return <main className="page"><div className="notice">Loading profile...</div></main>;
  }

  return (
    <main className="page detail-layout">
      <section className="panel profile-panel">
        <div className="avatar xl"><UserRound size={42} /></div>
        <div>
          <h1>{formateur.name}</h1>
          <p>{formateur.bio || 'Focused one-to-one language lessons.'}</p>
          <div className="chips">
            {(formateur.languages || []).map((language) => (
              <span className="chip" key={language.id}><Languages size={14} />{language.nom}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Available time slots</h2>
        <div className="slot-list">
          {slots.map((slot) => (
            <TimeSlotCard
              key={slot.id}
              slot={slot}
              actionLabel={user?.role === 'client' ? 'Book' : 'Login to book'}
              disabled={slot.est_reserve || (user && user.role !== 'client')}
              onBook={() => user?.role === 'client' && setSelectedSlot(slot)}
            />
          ))}
          {!slots.length && <p className="notice">No available slots.</p>}
        </div>
        {!user && <Link className="btn btn-primary" to="/login">Login to book</Link>}
      </section>

      <BookingModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} onBooked={load} />
    </main>
  );
}
