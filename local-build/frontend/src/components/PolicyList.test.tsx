import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PolicyList from './PolicyList';
import { POLICIES, POLICY_DETAIL } from '../test/fixtures';

const mockTrigger = vi.fn();
const mockDelete  = vi.fn();

vi.mock('../store/genappApi', () => ({
  useListPoliciesQuery: () => ({
    data: POLICIES, isLoading: false, isError: false, error: undefined,
  }),
  useLazyGetPolicyQuery: () => [
    mockTrigger,
    { data: POLICY_DETAIL, isFetching: false, isError: false, error: undefined },
  ],
  useDeletePolicyMutation: () => [
    mockDelete,
    { isLoading: false, isError: false, error: undefined },
  ],
}));

beforeEach(() => { vi.clearAllMocks(); });

describe('PolicyList – table', () => {
  it('renders all expected column headers', () => {
    render(<PolicyList />);
    expect(screen.getByRole('columnheader', { name: /policy #/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /customer #/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /type/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /issue date/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /expiry date/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /payment/i })).toBeInTheDocument();
  });

  it('renders a row for each policy', () => {
    render(<PolicyList />);
    expect(screen.getByText('500')).toBeInTheDocument(); // payment for policy 10
    expect(screen.getByText('750')).toBeInTheDocument(); // payment for policy 11
  });
});

describe('PolicyList – filters', () => {
  it('Search button is always visible', () => {
    render(<PolicyList />);
    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
  });

  it('renders a filter field for every table column', () => {
    render(<PolicyList />);
    expect(screen.getByLabelText('Policy #')).toBeInTheDocument();
    expect(screen.getByLabelText('Customer #')).toBeInTheDocument();
    expect(screen.getByLabelText('Policy type')).toBeInTheDocument();
    expect(screen.getByLabelText('Issue date from')).toBeInTheDocument();
    expect(screen.getByLabelText('Issue date to')).toBeInTheDocument();
    expect(screen.getByLabelText('Expiry date from')).toBeInTheDocument();
    expect(screen.getByLabelText('Expiry date to')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment')).toBeInTheDocument();
  });

  it('filters by policy number client-side', async () => {
    render(<PolicyList />);
    await userEvent.type(screen.getByLabelText('Policy #'), '10');
    // policy 11 and 12 should be gone
    expect(screen.queryByText('750')).not.toBeInTheDocument();
  });

  it('filters by policy type dropdown', async () => {
    render(<PolicyList />);
    await userEvent.selectOptions(screen.getByLabelText('Policy type'), 'H');
    expect(screen.getByText('500')).toBeInTheDocument();   // House policy
    expect(screen.queryByText('750')).not.toBeInTheDocument(); // Motor policy
  });

  it('shows the count of filtered vs total rows', async () => {
    render(<PolicyList />);
    await userEvent.selectOptions(screen.getByLabelText('Policy type'), 'H');
    expect(screen.getByText(/1 of 3/i)).toBeInTheDocument();
  });
});

describe('PolicyList – detail panel', () => {
  it('panel is hidden before any row is selected', () => {
    render(<PolicyList />);
    expect(screen.queryByText(/policy \d+/i)).not.toBeInTheDocument();
  });

  it('clicking a row opens the detail panel and fetches detail', async () => {
    render(<PolicyList />);
    const rows = screen.getAllByRole('row');
    await userEvent.click(rows[1]); // first data row
    expect(mockTrigger).toHaveBeenCalled();
    expect(screen.getByText(/policy \d+/i)).toBeInTheDocument();
  });

  it('Delete button is visible in the panel header immediately', async () => {
    render(<PolicyList />);
    await userEvent.click(screen.getAllByRole('row')[1]);
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
  });

  it('clicking Delete shows a confirmation warning with cascade note', async () => {
    render(<PolicyList />);
    await userEvent.click(screen.getAllByRole('row')[1]);
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
    expect(screen.getByText(/linked claims/i)).toBeInTheDocument();
  });

  it('clicking Close dismisses the panel', async () => {
    render(<PolicyList />);
    await userEvent.click(screen.getAllByRole('row')[1]);
    await userEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(screen.queryByText(/policy \d+/i)).not.toBeInTheDocument();
  });
});
