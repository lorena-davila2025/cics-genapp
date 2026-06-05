import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Stub all child components so App navigation tests are isolated
vi.mock('./components/CustomerList',   () => ({ default: () => <div>CustomerList</div>   }));
vi.mock('./components/CustomerCreate', () => ({ default: () => <div>CustomerCreate</div> }));
vi.mock('./components/PolicyList',     () => ({ default: () => <div>PolicyList</div>     }));
vi.mock('./components/PolicyCreate',   () => ({ default: () => <div>PolicyCreate</div>   }));
vi.mock('./components/ClaimList',      () => ({ default: () => <div>ClaimList</div>      }));
vi.mock('./components/ClaimCreate',    () => ({ default: () => <div>ClaimCreate</div>    }));

describe('App – sidebar navigation', () => {
  it('renders all three entity sections with Browse and New items', () => {
    render(<App />);
    for (const section of ['Customers', 'Policies', 'Claims']) {
      expect(screen.getByText(section)).toBeInTheDocument();
    }
    expect(screen.getAllByText('Browse')).toHaveLength(3);
    expect(screen.getAllByText('New')).toHaveLength(3);
  });

  it('shows CustomerList by default', () => {
    render(<App />);
    expect(screen.getByText('CustomerList')).toBeInTheDocument();
  });

  it('switches to CustomerCreate when New is clicked under Customers', async () => {
    render(<App />);
    const newButtons = screen.getAllByText('New');
    await userEvent.click(newButtons[0]); // first New = Customers › New
    expect(screen.getByText('CustomerCreate')).toBeInTheDocument();
  });

  it('switches to PolicyList when Browse is clicked under Policies', async () => {
    render(<App />);
    const browseButtons = screen.getAllByText('Browse');
    await userEvent.click(browseButtons[1]); // second Browse = Policies
    expect(screen.getByText('PolicyList')).toBeInTheDocument();
  });

  it('switches to ClaimCreate when New is clicked under Claims', async () => {
    render(<App />);
    const newButtons = screen.getAllByText('New');
    await userEvent.click(newButtons[2]); // third New = Claims
    expect(screen.getByText('ClaimCreate')).toBeInTheDocument();
  });
});
