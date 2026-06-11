import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [languages, setLanguages] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const { data } = await api.get('/langues');
        setLanguages(data);
      } catch (err) {
        console.error('Failed to fetch languages:', err);
      }
    };
    fetchLanguages();
  }, []);

  const handleLanguageChange = (languageId) => {
    setSelectedLanguages(prev => 
      prev.includes(languageId) 
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId]
    );
  };

  const handleFileChange = (e) => {
    setCertifications(e.target.files);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      let payload;
      let config = {};

      if (form.role === 'formateur') {
        payload = new FormData();
        payload.append('name', form.name);
        payload.append('email', form.email);
        payload.append('password', form.password);
        payload.append('role', form.role);
        payload.append('hourly_rate', hourlyRate);
        
        selectedLanguages.forEach(languageId => {
          payload.append('languages[]', languageId);
        });
        
        if (certifications.length > 0) {
          Array.from(certifications).forEach(file => {
            payload.append('certifications[]', file);
          });
        }

        config.headers = {
          'Content-Type': 'multipart/form-data',
        };
      } else {
        payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        };
      }

      const data = await register(payload, config);
      setMessage(data.message);
      setForm({ name: '', email: '', password: '', role: 'client' });
      setSelectedLanguages([]);
      setCertifications([]);
      setHourlyRate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <main className="auth-page">
      <form className="panel auth-form" onSubmit={submit}>
        <h1>Register</h1>
        <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
        <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength="6" required /></label>
        <label>Role
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value="client">Client</option>
            <option value="formateur">Formateur</option>
          </select>
        </label>
        
        {form.role === 'formateur' && (
          <>
            <p className="notice">Formateur accounts must be verified by an admin before login.</p>
            
            <label>Languages (select all that apply)
              <div className="checkbox-group">
                {languages.map(language => (
                  <label key={language.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={language.id}
                      checked={selectedLanguages.includes(language.id)}
                      onChange={() => handleLanguageChange(language.id)}
                    />
                    {language.nom}
                  </label>
                ))}
              </div>
            </label>
            
            <label>Certifications (PDF, JPG, JPEG, PNG)
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </label>
            
            <label>Hourly Rate ($)
              <input
                type="number"
                step="0.01"
                min="0"
                value={hourlyRate}
                onChange={(event) => setHourlyRate(event.target.value)}
                required={form.role === 'formateur'}
              />
            </label>
          </>
        )}
        
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit">Create account</button>
        <p className="muted">Already registered? <Link to="/login">Login</Link></p>
      </form>
    </main>
  );
}
