import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import FormateurDashboard from './pages/FormateurDashboard';
import FormateurDetail from './pages/FormateurDetail';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/formateur/:id" element={<FormateurDetail />} />
        <Route
          path="/client-dashboard"
          element={<PrivateRoute roles={['client']}><ClientDashboard /></PrivateRoute>}
        />
        <Route
          path="/formateur-dashboard"
          element={<PrivateRoute roles={['formateur']}><FormateurDashboard /></PrivateRoute>}
        />
        <Route
          path="/admin-dashboard"
          element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>}
        />
      </Routes>
    </>
  );
}
