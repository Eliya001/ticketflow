import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const BOOKING_API = 'http://52.224.188.5/api/bookings';

function MyBookings({ userId, onBack }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    async function fetchBookings() {
        setLoading(true);
        const res = await axios.get(`${BOOKING_API}/users/${userId}/bookings`);
        setBookings(res.data);
        setLoading(false);
    }

    return (
        <div className="venue-container">
            <button onClick={onBack} className="back-button">← Back to seats</button>
            <h2 style={{ color: '#f9fafb', marginBottom: '20px' }}>My Bookings</h2>

            {loading && <p style={{ color: '#9ca3af' }}>Loading...</p>}

            {!loading && bookings.length === 0 && (
                <p style={{ color: '#9ca3af' }}>No bookings yet.</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bookings.map((b) => (
                    <div key={b.id} className="booking-card">
                        <div>
                            <strong style={{ color: '#f9fafb' }}>{b.event_name}</strong>
                            <div style={{ color: '#9ca3af', fontSize: '13px' }}>{b.venue}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#f9fafb', fontWeight: '700' }}>Seat {b.seat_label}</div>
                            <div className={`status-tag ${b.status}`}>{b.status}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
MyBookings.propTypes = {
  userId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};
export default MyBookings;
