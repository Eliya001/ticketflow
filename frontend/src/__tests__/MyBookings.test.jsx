import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import MyBookings from '../MyBookings';

vi.mock('axios');

describe('MyBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading then renders bookings', async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, event_name: 'Coldplay Live', venue: 'National Stadium', seat_label: 'A1', status: 'confirmed' }],
    });

    render(<MyBookings userId="1" onBack={() => {}} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Coldplay Live')).toBeInTheDocument();
    });
  });

  it('shows "No bookings yet." when list is empty', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<MyBookings userId="1" onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('No bookings yet.')).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    const onBack = vi.fn();

    render(<MyBookings userId="1" onBack={onBack} />);

    fireEvent.click(screen.getByText('← Back to seats'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
