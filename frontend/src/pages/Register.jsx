import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const data = await register(form);
      setMessage(data.message);
      setForm({ name: '', email: '', password: '', role: 'client' });
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
        {form.role === 'formateur' && <p className="notice">Formateur accounts must be verified by an admin before login.</p>}
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit">Create account</button>
        <p className="muted">Already registered? <Link to="/login">Login</Link></p>
      </form>
    </main>
  );
}
