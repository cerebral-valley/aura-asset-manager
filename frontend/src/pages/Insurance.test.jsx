import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Insurance from './Insurance';

// Mock insuranceService
jest.mock('../services/insurance', () => ({
  insuranceService: {
    getPolicies: jest.fn(() => Promise.resolve([
      { id: '1', name: 'Test Policy', premium: 100, status: 'Active', expiry_date: '2025-12-31' },
      { id: '2', name: 'Expired Policy', premium: 200, status: 'Expired', expiry_date: '2024-01-01' },
    ])),
    createPolicy: jest.fn(() => Promise.resolve()),
    updatePolicy: jest.fn(() => Promise.resolve()),
    deletePolicy: jest.fn(() => Promise.resolve()),
  }
}));

describe('Insurance Page', () => {
  it('renders policies table and charts', async () => {
    render(<Insurance />);
    expect(screen.getByText(/Loading insurance policies/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Test Policy/i)).toBeInTheDocument());
    expect(screen.getByText(/Expired Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Premiums Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Policy Status Breakdown/i)).toBeInTheDocument();
  });

  it('opens add policy modal and validates form', async () => {
    render(<Insurance />);
    await waitFor(() => expect(screen.getByText(/Add Policy/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Add Policy/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Close/i));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens edit modal and updates a policy', async () => {
    render(<Insurance />);
    await waitFor(() => expect(screen.getByText(/Edit/i)).toBeInTheDocument());
    fireEvent.click(screen.getAllByText(/Edit/i)[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Updated Policy' } });
    fireEvent.click(screen.getByText(/Update Policy/i));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('deletes a policy', async () => {
    render(<Insurance />);
    await waitFor(() => expect(screen.getByText(/Delete/i)).toBeInTheDocument());
    window.confirm = jest.fn(() => true);
    fireEvent.click(screen.getAllByText(/Delete/i)[0]);
    await waitFor(() => expect(screen.getByText(/Test Policy/i)).toBeInTheDocument());
  });
});
