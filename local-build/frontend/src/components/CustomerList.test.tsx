import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerList from './CustomerList';
import { CUSTOMERS, CUSTOMER_DETAIL } from '../test/fixtures';

const mockTrigger    = vi.fn();
const mockUpdate     = vi.fn();
const mockDelete     = vi.fn();

vi.mock('../store/genappApi', () => ({
  useListCustomersQuery: () => ({
    data: CUSTOMERS, isLoading: false, isError: false, error: undefined,
  }),
  useLazyGetCustomerQuery: () => [
    mockTrigger,
    { data: CUSTOMER_DETAIL, isFetching: false, isError: false, error: undefined },
  ],
  useUpdateCustomerMutation: () => [
    mockUpdate,
    { isLoading: false, isError: false, error: undefined, data: undefined },
  ],
  useDeleteCustomerMutation: () => [
    mockDelete,
    { isLoading: false, isError: false, error: undefined },
  ],
}));

beforeEach(() => { vi.clearAllMocks(); });

describe('CustomerList – table', () => {
  it('renders all expected column headers', () => {
    render(<CustomerList />);
    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /date of birth/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /postcode/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /policies/i })).toBeInTheDocument();
  });

  it('renders a row for each customer', () => {
    render(<CustomerList />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
  });
});

describe('CustomerList – filters', () => {
  it('renders a filter field for every table column', () => {
    render(<CustomerList />);
    expect(screen.getByLabelText(/customer #/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/min policies/i)).toBeInTheDocument();
  });

  it('filters rows by name in real time', async () => {
    render(<CustomerList />);
    await userEvent.type(screen.getByLabelText('Name'), 'alice');
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('filters rows by customer number', async () => {
    render(<CustomerList />);
    await userEvent.type(screen.getByLabelText(/customer #/i), '2');
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('filters rows by postcode', async () => {
    render(<CustomerList />);
    await userEvent.type(screen.getByLabelText(/postcode/i), 'N1');
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('filters by min policies', async () => {
    render(<CustomerList />);
    await userEvent.type(screen.getByLabelText(/min policies/i), '1');
    // Bob has 0 policies, should be hidden
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('shows the count of filtered vs total rows', async () => {
    render(<CustomerList />);
    await userEvent.type(screen.getByLabelText('Name'), 'alice');
    expect(screen.getByText(/1 of 3/i)).toBeInTheDocument();
  });

  it('Search button is always visible', () => {
    render(<CustomerList />);
    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
  });

  it('shows Clear button when a filter is active and clears on click', async () => {
    render(<CustomerList />);
    await userEvent.type(screen.getByLabelText('Name'), 'alice');
    const clear = screen.getByRole('button', { name: /clear/i });
    expect(clear).toBeInTheDocument();
    await userEvent.click(clear);
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});

describe('CustomerList – detail panel', () => {
  it('panel is hidden before any row is selected', () => {
    render(<CustomerList />);
    expect(screen.queryByText(/customer \d+/i)).not.toBeInTheDocument();
  });

  it('clicking a row opens the detail panel and fetches detail', async () => {
    render(<CustomerList />);
    await userEvent.click(screen.getByText('Alice'));
    expect(mockTrigger).toHaveBeenCalledWith('1');
    expect(screen.getByText(/customer 1/i)).toBeInTheDocument();
  });

  it('Edit and Delete buttons are visible in the panel header immediately', async () => {
    render(<CustomerList />);
    await userEvent.click(screen.getByText('Alice'));
    expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
  });

  it('clicking Edit shows the inline edit form', async () => {
    render(<CustomerList />);
    await userEvent.click(screen.getAllByRole('row')[1]);
    await userEvent.click(screen.getByRole('button', { name: /^edit$/i }));
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
  });

  it('edit form is pre-filled with the customer detail data', async () => {
    render(<CustomerList />);
    await userEvent.click(screen.getAllByRole('row')[1]);
    await userEvent.click(screen.getByRole('button', { name: /^edit$/i }));
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('19801015')).toBeInTheDocument();
  });

  it('clicking Delete shows a confirmation warning', async () => {
    render(<CustomerList />);
    await userEvent.click(screen.getByText('Alice'));
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
    expect(screen.getByText(/permanently delete customer/i)).toBeInTheDocument();
  });

  it('clicking Close dismisses the panel', async () => {
    render(<CustomerList />);
    await userEvent.click(screen.getByText('Alice'));
    await userEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(screen.queryByText(/customer 1/i)).not.toBeInTheDocument();
  });

  it('clicking a selected row again deselects it', async () => {
    render(<CustomerList />);
    await userEvent.click(screen.getAllByRole('row')[1]);
    expect(screen.getByText(/customer 1/i)).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('row')[1]);
    expect(screen.queryByText(/customer 1/i)).not.toBeInTheDocument();
  });
});
