import { Languages, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FormateurCard({ formateur }) {
  return (
    <article className="card formateur-card">
      <div className="avatar"><UserRound size={28} /></div>
      <div className="card-body">
        <h3>{formateur.name}</h3>
        <p>{formateur.bio || 'Experienced language tutor ready for focused lessons.'}</p>
        
        <div className="chips">
          {(formateur.languages || []).map((language) => (
            <span className="chip" key={language.id}>
              <Languages size={14} />
              {language.nom}
            </span>
          ))}
          {(formateur.languages || []).length === 0 && <span className="chip muted">No languages yet</span>}
        </div>
        
      </div>
      <Link className="btn btn-primary" to={`/formateur/${formateur.id}`}>View details</Link>
    </article>
  );
}
