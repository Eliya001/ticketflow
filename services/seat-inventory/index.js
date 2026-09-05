const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
    }
});

redisClient.on('error', (err) => {
    console.error('Redis client error (handled, not crashing):', err.message);
});


redisClient.connect();

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

app.get('/events/:eventId/seats', async (req, res) => {
    const { eventId } = req.params;
    const result = await pool.query(
        'SELECT id, seat_label, status FROM seats WHERE event_id = $1',
        [eventId]
    );
    res.json(result.rows);
});

app.post('/seats/:seatId/lock', async (req, res) => {
    const { seatId } = req.params;
    const lockKey = `seat-lock:${seatId}`;

    const acquired = await redisClient.set(lockKey, 'locked', {
        NX: true,
        EX: 300
    });

    if (!acquired) {
        return res.status(409).json({ error: 'Seat already locked' });
    }

    await pool.query(
        "UPDATE seats SET status = 'locked' WHERE id = $1",
        [seatId]
    );

    broadcast({ type: 'SEAT_LOCKED', seatId: parseInt(seatId) });
   res.json({ success: true });
});

app.post('/seats/:seatId/release', async (req, res) => {
    const { seatId } = req.params;
    const lockKey = `seat-lock:${seatId}`;

    await redisClient.del(lockKey);
    await pool.query(
        "UPDATE seats SET status = 'available' WHERE id = $1",
        [seatId]
    );

    broadcast({ type: 'SEAT_RELEASED', seatId: parseInt(seatId) });
    res.json({ success: true });
});

app.post('/seats/:seatId/confirm', async (req, res) => {
    const { seatId } = req.params;

    await pool.query(
        "UPDATE seats SET status = 'booked' WHERE id = $1",
        [seatId]
    );

    broadcast({ type: 'SEAT_BOOKED', seatId: parseInt(seatId) });
    res.json({ success: true });
});

const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
    console.log(`Seat-inventory service running on port ${PORT}`);
});
