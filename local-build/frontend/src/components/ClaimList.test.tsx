import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClaimList from './ClaimList';
import { CLAIMS, CLAIM_DETAIL } from '../test/fixtures';

const mockTrigger = vi.fn();
const mockDelete  = vi.fn();

vi.mock('../store/genappApi', () => ({
  useListClaimsQuery: () => ({
    data: CLAIMS, isLoading: false, isError: false, error: undefined,
  }),
  useLazyGetClaimQuery: () => [
    mockTrigger,
    { data: CLAIM_DETAIL, isFetching: false, isError: false, error: undefined },
  ],
  useDeleteClaimMutation: () => [
    mockDelete,
    { isLoading: false, isError: false, error: undefined },
  ],
}));

beforeEach(() => { vi.clearAllMocks(); });

describe('ClaimList – table', () => {
  it('renders all expected column headers', () => {
    render(<ClaimList />);
    expect(screen.getByRole('columnheader', { name: /claim #/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /policy #/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /date/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /cause/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /amount/i })).toBeInTheDocument();
  });

  it('renders a row for each claim', () => {
    render(<ClaimList />);
    expect(screen.getByText('Fire damage')).toBeInTheDocument();
    expect(screen.getByText('Water leak')).toBeInTheDocument();
    expect(screen.getByText('Theft')).toBeInTheDocument();
  });
});

describe('ClaimList – filters', () => {
  it('renders a filter field for every table column', () => {
    render(<ClaimList />);
    expect(screen.getByLabelText('Claim #')).toBeInTheDocument();
    expect(screen.getByLabelText('Policy #')).toBeInTheDocument();
    expect(screen.getByLabelText('Date from')).toBeInTheDocument();
    expect(screen.getByLabelText('Date to')).toBeInTheDocument();
    expect(screen.getByLabelText('Cause contains')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount from')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount to')).toBeInTheDocument();
  });

  it('filters by claim number client-side', async () => {
    render(<ClaimList />);
    await userEvent.type(screen.getByLabelText('Claim #'), '100');
    expect(screen.getByText('Fire damage')).toBeInTheDocument();
    expect(screen.queryByText('Water leak')).not.toBeInTheDocument();
  });

  it('filters by cause (case-insensitive)', async () => {
    render(<ClaimList />);
    await userEvent.type(screen.getByLabelText('Cause contains'), 'fire');
    expect(screen.getByText('Fire damage')).toBeInTheDocument();
    expect(screen.queryByText('Water leak')).not.toBeInTheDocument();
    expect(screen.queryByText('Theft')).not.toBeInTheDocument();
  });

  it('filters by amount range', async () => {
    render(<ClaimList />);
    await userEvent.type(screen.getByLabelText('Amount from'), '4000');
    // Only Fire damage (5000) and Theft (8000) should remain
    expect(screen.getByText('Fire damage')).toBeInTheDocument();
    expect(screen.getByText('Theft')).toBeInTheDocument();
    expect(screen.queryByText('Water leak')).not.toBeInTheDocument();
  });

  it('shows the count of filtered vs total rows', async () => {
    render(<ClaimList />);
    await userEvent.type(screen.getByLabelText('Cause contains'), 'fire');
    expect(screen.getByText(/1 of 3/i)).toBeInTheDocument();
  });

  it('shows Clear button when a filter is active', async () => {
    render(<ClaimList />);
    await userEvent.type(screen.getByLabelText('Cause contains'), 'fire');
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });
});

describe('ClaimList – detail panel', () => {
  it('panel is hidden before any row is selected', () => {
    render(<ClaimList />);
    expect(screen.queryByText(/claim.*detail/i)).not.toBeInTheDocument();
  });

  it('clicking a row opens the detail panel and fetches detail', async () => {
    render(<ClaimList />);
    await userEvent.click(screen.getByText('Fire damage'));
    expect(mockTrigger).toHaveBeenCalledWith('100');
    expect(screen.getByText(/claim 100/i)).toBeInTheDocument();
  });

  it('Delete button is visible in the panel header immediately', async () => {
    render(<ClaimList />);
    await userEvent.click(screen.getByText('Fire damage'));
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
  });

  it('clicking Delete shows a confirmation warning', async () => {
    render(<ClaimList />);
    await userEvent.click(screen.getByText('Fire damage'));
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
    expect(screen.getByText(/permanently delete claim/i)).toBeInTheDocument();
  });

  it('detail panel shows full claim data', async () => {
    render(<ClaimList />);
    await userEvent.click(screen.getByText('Fire damage'));
    expect(screen.getByText('Kitchen fire, partial damage')).toBeInTheDocument(); // observations
  });

  it('clicking Close dismisses the panel', async () => {
    render(<ClaimList />);
    await userEvent.click(screen.getByText('Fire damage'));
    await userEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(screen.queryByText(/claim 100/i)).not.toBeInTheDocument();
  });
});
