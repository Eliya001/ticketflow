import { useState, useEffect } from 'react';
import axios from 'axios';
import './SeatMap.css';

const SEAT_API = 'http://localhost:4001';
const BOOKING_API = 'http://localhost:4000';

function SeatMap({ eventId, userId }) {
    const [seats, setSeats] = useState([]);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lockTimers, setLockTimers] = useState({});

    useEffect(() => {
        fetchSeats();
        const ws = new WebSocket('ws://localhost:4001');

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleLiveUpdate(data);
        };

        return () => ws.close();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setLockTimers((prev) => ({ ...prev }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    async function fetchSeats() {
        const res = await axios.get(`${SEAT_API}/events/${eventId}/seats`);
        setSeats(res.data);
    }

    function handleLiveUpdate(data) {
        setSeats((prevSeats) =>
            prevSeats.map((seat) => {
                if (seat.id !== data.seatId) return seat;

                if (data.type === 'SEAT_LOCKED') return { ...seat, status: 'locked' };
                if (data.type === 'SEAT_RELEASED') return { ...seat, status: 'available' };
                if (data.type === 'SEAT_BOOKED') return { ...seat, status: 'booked' };

                return seat;
            })
        );

        if (data.type === 'SEAT_LOCKED') {
            startCountdown(data.seatId);
        }

        if (data.type === 'SEAT_RELEASED' || data.type === 'SEAT_BOOKED') {
            setLockTimers((prev) => {
                const updated = { ...prev };
                delete updated[data.seatId];
                return updated;
            });
        }
    }

    function startCountdown(seatId) {
        const expiresAt = Date.now() + 5 * 60 * 1000;
        setLockTimers((prev) => ({ ...prev, [seatId]: expiresAt }));
    }

    function getRemainingSeconds(seatId) {
        const expiresAt = lockTimers[seatId];
        if (!expiresAt) return null;
        const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        return remaining;
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    async function handleBookSeat(seatId, seatLabel) {
        setLoading(true);
        setMessage('');

        try {
            const res = await axios.post(`${BOOKING_API}/bookings`, {
                userId,
                eventId,
                seatId
            });
            setIsError(false);
            setMessage(`Seat ${seatLabel} booked! Booking #${res.data.bookingId}`);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Booking failed';
            setIsError(true);
            setMessage(`Seat ${seatLabel}: ${errorMsg}`);
        }

        setLoading(false);
    }

    function groupByRow() {
        const rows = {};
        seats.forEach((seat) => {
            const rowLetter = seat.seat_label.charAt(0);
            if (!rows[rowLetter]) rows[rowLetter] = [];
            rows[rowLetter].push(seat);
        });
        return rows;
    }

    const rows = groupByRow();

    return (
        <div className="venue-container">
            <div className="stage">STAGE</div>

            <div className="legend">
                <div className="legend-item">
                    <div className="legend-swatch" style={{ backgroundColor: '#22c55e' }}></div>
                    Available
                </div>
                <div className="legend-item">
                    <div className="legend-swatch" style={{ backgroundColor: '#eab308' }}></div>
                    Held
                </div>
                <div className="legend-item">
                    <div className="legend-swatch" style={{ backgroundColor: '#ef4444' }}></div>
                    Booked
                </div>
            </div>

            <div className="seat-grid">
                {Object.keys(rows).map((rowLetter) => {
                    const rowSeats = rows[rowLetter];
                    const center = (rowSeats.length - 1) / 2;

                    return (
                        <div className="seat-row" key={rowLetter}>
                            {rowSeats.map((seat, index) => {
                                const distance = Math.abs(index - center);
                                const curveOffset = distance * distance * 3;

                                return (
                                    <button
                                        key={seat.id}
                                        className={`seat ${seat.status}`}
                                        disabled={seat.status !== 'available' || loading}
                                        onClick={() => handleBookSeat(seat.id, seat.seat_label)}
                                        style={{ transform: `translateY(${curveOffset}px)` }}
                                    >
                                        {seat.status === 'locked' && getRemainingSeconds(seat.id) !== null
                                            ? formatTime(getRemainingSeconds(seat.id))
                                            : seat.seat_label}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {message && (
                <div className={`status-message ${isError ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default SeatMap;
