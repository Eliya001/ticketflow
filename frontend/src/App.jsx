import { useState } from 'react';
import SeatMap from './SeatMap';
import MyBookings from './MyBookings';

function App() {
    const [view, setView] = useState('seats');

    return (
        <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'Inter', sans-serif" }}>
            <div style={{
                height: '260px',
                maxWidth: '750px',
                margin: '0 auto',
                backgroundImage: `linear-gradient(180deg, rgba(15,17,23,0.2) 0%, rgba(15,17,23,1) 100%), url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                paddingBottom: '24px',
                paddingLeft: '40px',
                borderRadius: '0 0 16px 16px'
            }}>
                <h1 style={{
                    color: '#f9fafb',
                    fontSize: '38px',
                    fontWeight: '800',
                    margin: 0,
                    textShadow: '0 2px 10px rgba(0,0,0,0.6)'
                }}>
                    Coldplay Live
                </h1>
                <p style={{
                    color: '#d1d5db',
                    fontSize: '15px',
                    margin: '6px 0 0 0',
                    textShadow: '0 2px 8px rgba(0,0,0,0.6)'
                }}>
                    National Stadium — Dec 1, 2026
                </p>
            </div>

            <div style={{
                maxWidth: '750px',
                margin: '0 auto',
                paddingTop: '20px',
                paddingLeft: '20px',
                paddingRight: '20px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
            }}>
                {view === 'seats' && (
                    <button className="nav-button" onClick={() => setView('bookings')}>
                        My Bookings
                    </button>
                )}
            </div>

            <div style={{ paddingTop: '20px' }}>
                {view === 'seats' && <SeatMap eventId={1} userId={1} />}
                {view === 'bookings' && <MyBookings userId={1} onBack={() => setView('seats')} />}
            </div>
        </div>
    );
}

export default App;
