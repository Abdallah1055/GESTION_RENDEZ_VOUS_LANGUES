import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function calculateTotalPrice(slot) {
  if (!slot || !slot.formateur?.hourly_rate) {
    return 0;
  }
  const startTime = new Date(`1970-01-01T${slot.heure_debut}`);
  const endTime = new Date(`1970-01-01T${slot.heure_fin}`);
  const duration = (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
  return slot.formateur.hourly_rate * duration;
}

function ModalShell({ children, error, onClose, onConfirm, processing, intent, amount }) {

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <button className="icon-btn modal-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h2>Confirm lesson</h2>
        <p className="muted">Amount: {amount.toFixed(2)} $</p>
        {children}
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="button" onClick={onConfirm} disabled={processing || !intent}>
            {processing ? 'Processing...' : 'Pay and book'}
          </button>
        </div>
      </section>
    </div>
  );
}

function MockBookingForm({ slot, onClose, onBooked, intent, error, setError }) {
  const [processing, setProcessing] = useState(false);
  const amount = useMemo(() => calculateTotalPrice(slot), [slot]);

  const confirmBooking = async () => {
    setError('');
    setProcessing(true);

    try {
      await api.post('/reservations', {
        time_slot_id: slot.id,
        payment_intent_id: intent.payment_intent_id,
      });

      onBooked?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ModalShell error={error} intent={intent} onClose={onClose} onConfirm={confirmBooking} processing={processing} amount={amount}>
      <p className="notice">Mock payment mode is active. No real card will be charged.</p>
    </ModalShell>
  );
}

function StripeBookingForm({ slot, onClose, onBooked, intent, error, setError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const amount = useMemo(() => calculateTotalPrice(slot), [slot]);

  const confirmBooking = async () => {
    setError('');
    setProcessing(true);

    try {
      if (!stripe || !elements) {
        setError('Stripe is still loading.');
        return;
      }

      const result = await stripe.confirmCardPayment(intent.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      await api.post('/reservations', {
        time_slot_id: slot.id,
        payment_intent_id: result.paymentIntent.id,
      });

      onBooked?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ModalShell error={error} intent={intent} onClose={onClose} onConfirm={confirmBooking} processing={processing} amount={amount}>
      <div className="stripe-box">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
    </ModalShell>
  );
}

export default function BookingModal({ slot, onClose, onBooked }) {
  const options = useMemo(() => ({}), []);
  const [intent, setIntent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slot) {
      return;
    }

    setIntent(null);
    setError('');

    api.post('/payment-intent')
      .then(({ data }) => setIntent(data))
      .catch((err) => setError(err.response?.data?.message || 'Payment could not be initialized.'));
  }, [slot]);

  if (!slot) {
    return null;
  }

  if (!intent || intent.mock || !stripePromise) {
    return (
      <MockBookingForm
        error={error}
        intent={intent}
        onBooked={onBooked}
        onClose={onClose}
        setError={setError}
        slot={slot}
      />
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeBookingForm
        error={error}
        intent={intent}
        onBooked={onBooked}
        onClose={onClose}
        setError={setError}
        slot={slot}
      />
    </Elements>
  );
}
