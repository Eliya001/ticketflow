const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkForNewBookings() {
    const result = await pool.query(
        `SELECT id, user_id, event_id, seat_id
         FROM bookings
         WHERE status = 'confirmed' AND notified = false`
    );

    for (const booking of result.rows) {
        console.log(`Sending confirmation email for booking #${booking.id} to user #${booking.user_id}`);

        await pool.query(
            'UPDATE bookings SET notified = true WHERE id = $1',
            [booking.id]
        );
    }
}

setInterval(checkForNewBookings, 5000);

console.log('Notification-worker started, checking every 5 seconds');
