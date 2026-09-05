CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    venue VARCHAR(150) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    seat_label VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    UNIQUE(event_id, seat_label)
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_id INTEGER REFERENCES events(id),
    seat_id INTEGER REFERENCES seats(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
