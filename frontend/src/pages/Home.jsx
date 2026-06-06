import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';
import FormateurCard from '../components/FormateurCard';

export default function Home() {
  const [formateurs, setFormateurs] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [search, setSearch] = useState('');
  const [languageId, setLanguageId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFormateurs = async () => {
    setLoading(true);
    const { data } = await api.get('/formateurs', {
      params: { search: search || undefined, language_id: languageId || undefined },
    });
    setFormateurs(data);
    setLoading(false);
  };

  useEffect(() => {
    api.get('/langues').then(({ data }) => setLanguages(data));
  }, []);

  useEffect(() => {
    loadFormateurs();
  }, [languageId]);

  return (
    <main className="page">
      <section className="toolbar">
        <div>
          <h1>Find a language formateur</h1>
          <p>Browse verified tutors and reserve available lesson slots.</p>
        </div>
        <form className="search-row" onSubmit={(event) => { event.preventDefault(); loadFormateurs(); }}>
          <label className="input-with-icon">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or language" />
          </label>
          <select value={languageId} onChange={(event) => setLanguageId(event.target.value)}>
            <option value="">All languages</option>
            {languages.map((language) => <option key={language.id} value={language.id}>{language.nom}</option>)}
          </select>
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
      </section>

      {loading ? <div className="notice">Loading formateurs...</div> : (
        <section className="grid-list">
          {formateurs.map((formateur) => <FormateurCard key={formateur.id} formateur={formateur} />)}
          {!formateurs.length && <div className="notice">No verified formateurs found.</div>}
        </section>
      )}
    </main>
  );
}
