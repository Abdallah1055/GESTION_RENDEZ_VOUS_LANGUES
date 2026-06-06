import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin-dashboard' : user.role === 'formateur' ? '/formateur-dashboard' : '/client-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <main className="auth-page">
      <form className="panel auth-form" onSubmit={submit}>
        <h1>Login</h1>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
        <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit">Login</button>
        <p className="muted">No account? <Link to="/register">Register</Link></p>
      </form>
    </main>
  );
}
