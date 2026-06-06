import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function BookingForm({ slot, onClose, onBooked }) {
  const stripe = useStripe();
  const elements = useElements();
  const [intent, setIntent] = useState(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.post('/payment-intent')
      .then(({ data }) => setIntent(data))
      .catch((err) => setError(err.response?.data?.message || 'Payment could not be initialized.'));
  }, []);

  const confirmBooking = async () => {
    setError('');
    setProcessing(true);

    try {
      let paymentIntentId = intent?.payment_intent_id;

      if (intent?.client_secret) {
        if (!stripe || !elements) {
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

        paymentIntentId = result.paymentIntent.id;
      }

      await api.post('/reservations', {
        time_slot_id: slot.id,
        payment_intent_id: paymentIntentId,
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
    <div className="modal-backdrop">
      <section className="modal">
        <button className="icon-btn modal-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h2>Confirm lesson</h2>
        <p className="muted">Amount: 20 EUR</p>
        {intent?.client_secret && (
          <div className="stripe-box">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
        )}
        {!intent?.client_secret && <p className="notice">Local payment mode is active.</p>}
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="button" onClick={confirmBooking} disabled={processing || !intent}>
            {processing ? 'Processing...' : 'Pay and book'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function BookingModal(props) {
  const options = useMemo(() => ({}), []);

  if (!props.slot) {
    return null;
  }

  if (!stripePromise) {
    return <BookingForm {...props} />;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <BookingForm {...props} />
    </Elements>
  );
}
