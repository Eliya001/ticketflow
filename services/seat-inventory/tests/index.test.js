jest.mock('pg', () => {
  const mPool = { query: jest.fn() };
  return { Pool: jest.fn(() => mPool) };
});

jest.mock('redis', () => {
  const mClient = {
    connect: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };
  return { createClient: jest.fn(() => mClient) };
});

const request = require('supertest');
const { Pool } = require('pg');
const redis = require('redis');

const app = require('../index');
const pool = new Pool();
const redisClient = redis.createClient();

describe('seat-inventory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /events/:eventId/seats', () => {
    it('returns seats for an event', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, seat_label: 'A1', status: 'available' }],
      });

      const res = await request(app).get('/events/5/seats');

      expect(res.status).toBe(200);
      expect(res.body[0].seat_label).toBe('A1');
    });
  });

  describe('POST /seats/:seatId/lock', () => {
    it('locks an available seat', async () => {
      redisClient.set.mockResolvedValueOnce('OK');
      pool.query.mockResolvedValueOnce({});

      const res = await request(app).post('/seats/1/lock');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 409 when seat is already locked', async () => {
      redisClient.set.mockResolvedValueOnce(null);

      const res = await request(app).post('/seats/1/lock');

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Seat already locked');
    });
  });

  describe('POST /seats/:seatId/release', () => {
    it('releases a locked seat', async () => {
      redisClient.del.mockResolvedValueOnce(1);
      pool.query.mockResolvedValueOnce({});

      const res = await request(app).post('/seats/1/release');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /seats/:seatId/confirm', () => {
    it('confirms a seat booking', async () => {
      pool.query.mockResolvedValueOnce({});

      const res = await request(app).post('/seats/1/confirm');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
