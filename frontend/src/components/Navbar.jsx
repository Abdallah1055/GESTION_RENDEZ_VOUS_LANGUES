import { BookOpen, CalendarDays, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin-dashboard'
      : user?.role === 'formateur'
        ? '/formateur-dashboard'
        : '/client-dashboard';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatRole = (role) => {
    const roleMap = {
      admin: 'Admin',
      formateur: 'Formateur',
      client: 'Client',
    };
    return roleMap[role] || 'Unknown Role';
  };

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <BookOpen size={24} />
        <span>PreplyClone</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/">Formateurs</NavLink>
        {user && (
          <NavLink to={dashboardPath}>
            {user.role === 'admin' && <ShieldCheck size={17} />}
            {user.role === 'formateur' && <CalendarDays size={17} />}
            {user.role === 'client' && <UserRound size={17} />}
            Dashboard
          </NavLink>
        )}
      </nav>

      <div className="nav-actions">
        {!user ? (
          <>
            <Link className="btn btn-ghost" to="/login">Login</Link>
            <Link className="btn btn-primary" to="/register">Register</Link>
          </>
        ) : (
          <>
            <div className="user-profile">
              <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{formatRole(user.role)}</div>
              </div>
            </div>
            <button className="icon-text" type="button" onClick={handleLogout}>
              <LogOut size={18} />
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
