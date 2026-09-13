jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

jest.mock('axios');

const request = require('supertest');
const axios = require('axios');
const { Pool } = require('pg');

const app = require('../index');
const pool = new Pool();

describe('booking-api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /bookings', () => {
    it('creates a booking successfully', async () => {
      axios.post
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ data: { status: 'paid' } })
        .mockResolvedValueOnce({});

      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({});

      const res = await request(app)
        .post('/bookings')
        .send({ userId: 1, eventId: 2, seatId: 3 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.bookingId).toBe(1);
      expect(res.body.paymentStatus).toBe('paid');
    });

    it('returns 409 when seat cannot be locked', async () => {
      axios.post.mockRejectedValueOnce(new Error('locked'));

      const res = await request(app)
        .post('/bookings')
        .send({ userId: 1, eventId: 2, seatId: 3 });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Seat could not be locked');
    });
  });

  describe('GET /bookings/:id', () => {
    it('returns a booking by id', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, status: 'confirmed' }],
      });

      const res = await request(app).get('/bookings/1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.status).toBe('confirmed');
    });
  });

  describe('GET /users/:userId/bookings', () => {
    it('returns bookings for a user', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, event_name: 'Concert' }],
      });

      const res = await request(app).get('/users/1/bookings');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].event_name).toBe('Concert');
    });
  });
});
