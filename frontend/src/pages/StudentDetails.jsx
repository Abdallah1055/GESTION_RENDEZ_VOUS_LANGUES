import { ArrowLeft, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

export default function StudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [error, setError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading reservation details for ID:', id);
      const response = await api.get(`/formateur/reservations/${id}`);
      console.log('API Response:', response.data);
      setData(response.data);
      setMeetingUrl(response.data.meeting_url || '');
    } catch (error) {
      console.error('Error loading details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.message || error.message || 'Failed to load reservation details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUrl = async () => {
    try {
      console.log('Saving meeting URL:', meetingUrl);
      console.log('Reservation ID:', id);
      const response = await api.put(`/formateur/reservations/${id}/meeting-url`, {
        meeting_url: meetingUrl,
      });
      console.log('Save response:', response.data);
      setData({ ...data, meeting_url: response.data.meeting_url });
      setMeetingUrl(response.data.meeting_url || '');
      alert('Meeting URL saved');
    } catch (error) {
      console.error('Error saving URL:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      alert(`Error saving meeting URL: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCancelReservation = async () => {
    try {
      await api.patch(`/formateur/reservations/${id}/cancel`);
      alert('Reservation cancelled successfully');
      navigate('/formateur-dashboard');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Error cancelling reservation');
    }
  };

  if (loading) {
    return (
      <main className="page">
        <section className="panel">
          <p>Loading...</p>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="page">
        <section className="panel">
          <p className="error">{error || 'Reservation not found'}</p>
          <button className="btn btn-ghost" onClick={() => navigate('/formateur-dashboard')}>
            Back to Dashboard
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="panel">
        <button className="icon-text" onClick={() => navigate('/formateur-dashboard')} style={{ marginBottom: '16px' }}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <h1>Client Details</h1>

        {/* Client Information */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h2>Client Information</h2>
          <div style={{ marginTop: '12px' }}>
            <p><strong>Name:</strong> {data.student.name}</p>
            <p><strong>Email:</strong> {data.student.email}</p>
          </div>
        </div>

        {/* Reservation Information */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h2>Reservation Information</h2>
          <div style={{ marginTop: '12px' }}>
            <p><strong>Date:</strong> {data.reservation.date.split('T')[0]}</p>
            <p><strong>Start Time:</strong> {data.reservation.start_time.slice(0, 5)}</p>
            <p><strong>End Time:</strong> {data.reservation.end_time.slice(0, 5)}</p>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h2>Pricing Information</h2>
          <div style={{ marginTop: '12px' }}>
            <p><strong>Hourly Rate:</strong> {data.pricing.hourly_rate} $</p>
            <p><strong>Duration:</strong> {data.pricing.duration} hours</p>
            <p><strong>Total Price:</strong> {data.pricing.total_price.toFixed(2)} $</p>
          </div>
        </div>

    
        {/* Meeting URL */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h2>Meeting URL</h2>
          <div style={{ marginTop: '12px' }}>
            {data.meeting_url ? (
              <div>
                <p><strong>Current URL:</strong></p>
                <a href={data.meeting_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0f6f48', wordBreak: 'break-all' }}>
                  {data.meeting_url}
                </a>
              </div>
            ) : null}
            <div style={{ marginTop: '12px' }}>
              <label>
                {data.meeting_url ? 'Update Meeting URL:' : 'Add Meeting URL:'}
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  style={{ marginTop: '8px' }}
                />
              </label>
              <button className="btn btn-primary" onClick={handleSaveUrl} style={{ marginTop: '12px' }}>
                <Save size={17} /> Save URL
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <button className="btn btn-ghost danger" onClick={() => setShowCancelConfirm(true)}>
            <Trash2 size={17} /> Cancel Reservation
          </button>
        </div>
      </section>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="modal-backdrop" onClick={() => setShowCancelConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn modal-close" onClick={() => setShowCancelConfirm(false)}>
              <X size={20} />
            </button>
            <h2>Cancel Reservation</h2>
            <p>Are you sure you want to cancel this reservation?</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowCancelConfirm(false)}>
                No, Keep It
              </button>
              <button className="btn btn-ghost danger" onClick={handleCancelReservation}>
                Yes, Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
