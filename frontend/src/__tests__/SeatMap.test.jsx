import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import SeatMap from '../SeatMap';

vi.mock('axios');

describe('SeatMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches and renders seats grouped by row', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, seat_label: 'A1', status: 'available' },
        { id: 2, seat_label: 'A2', status: 'available' },
      ],
    });

    render(<SeatMap eventId="1" userId="1" />);

    await waitFor(() => {
      expect(screen.getByText('A1')).toBeInTheDocument();
      expect(screen.getByText('A2')).toBeInTheDocument();
    });
  });

  it('books an available seat and shows a success message', async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, seat_label: 'A1', status: 'available' }],
    });
    axios.post.mockResolvedValueOnce({ data: { bookingId: 99 } });

    render(<SeatMap eventId="1" userId="1" />);

    const seatButton = await screen.findByText('A1');
    fireEvent.click(seatButton);

    await waitFor(() => {
      expect(screen.getByText(/Seat A1 booked!/)).toBeInTheDocument();
    });
  });

  it('shows an error message when booking fails', async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, seat_label: 'A1', status: 'available' }],
    });
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Seat already locked' } },
    });

    render(<SeatMap eventId="1" userId="1" />);

    const seatButton = await screen.findByText('A1');
    fireEvent.click(seatButton);

    await waitFor(() => {
      expect(screen.getByText(/Seat already locked/)).toBeInTheDocument();
    });
  });

  it('disables a seat that is already booked', async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, seat_label: 'A1', status: 'booked' }],
    });

    render(<SeatMap eventId="1" userId="1" />);

    const seatButton = await screen.findByText('A1');
    expect(seatButton).toBeDisabled();
  });
});
