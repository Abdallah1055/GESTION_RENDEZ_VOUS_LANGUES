import { Clock3 } from 'lucide-react';

export default function TimeSlotCard({ slot, onBook, disabled, actionLabel = 'Book' }) {
  const date = new Date(`${slot.date}T00:00:00`);

  return (
    <article className="slot-card">
      <div>
        <strong>{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
        <span><Clock3 size={15} /> {slot.heure_debut.slice(0, 5)} - {slot.heure_fin.slice(0, 5)}</span>
      </div>
      <button className="btn btn-primary" type="button" onClick={() => onBook?.(slot)} disabled={disabled}>
        {disabled ? 'Reserved' : actionLabel}
      </button>
    </article>
  );
}
