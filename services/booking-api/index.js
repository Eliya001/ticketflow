const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const SEAT_SERVICE_URL = process.env.SEAT_SERVICE_URL;
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL;

app.post('/bookings', async (req, res) => {
    const { userId, eventId, seatId } = req.body;

    try {
        await axios.post(`${SEAT_SERVICE_URL}/seats/${seatId}/lock`);
    } catch (err) {
        return res.status(409).json({ error: 'Seat could not be locked' });
    }

    const bookingResult = await pool.query(
        `INSERT INTO bookings (user_id, event_id, seat_id, status)
         VALUES ($1, $2, $3, 'pending') RETURNING id`,
        [userId, eventId, seatId]
    );
    const bookingId = bookingResult.rows[0].id;

    let paymentResult;
    try {
        paymentResult = await axios.post(`${PAYMENT_SERVICE_URL}/charge`, {
            bookingId,
            amount: 1000
        });
    } catch (err) {
        await axios.post(`${SEAT_SERVICE_URL}/seats/${seatId}/release`);
        await pool.query(
            "UPDATE bookings SET status = 'cancelled' WHERE id = $1",
            [bookingId]
        );
        return res.status(402).json({ error: 'Payment failed' });
    }

    await axios.post(`${SEAT_SERVICE_URL}/seats/${seatId}/confirm`);
    await pool.query(
        "UPDATE bookings SET status = 'confirmed' WHERE id = $1",
        [bookingId]
    );

    res.json({
        success: true,
        bookingId,
        paymentStatus: paymentResult.data.status
    });
});

app.get('/bookings/:id', async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(
        'SELECT * FROM bookings WHERE id = $1',
        [id]
    );
    res.json(result.rows[0]);
});

app.get('/users/:userId/bookings', async (req, res) => {
    const { userId } = req.params;
    const result = await pool.query(
        `SELECT b.id, b.status, b.created_at, e.name AS event_name, e.venue, s.seat_label
         FROM bookings b
         JOIN events e ON b.event_id = e.id
         JOIN seats s ON b.seat_id = s.id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC`,
        [userId]
    );
    res.json(result.rows);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Booking-api service running on port ${PORT}`);
});
