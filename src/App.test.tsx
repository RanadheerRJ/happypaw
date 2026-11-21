import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

/** Public-site smoke test: the landing page renders its hero and key sections. */
describe('public site smoke test', () => {
  it('renders the hero headline and primary CTAs', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { level: 1, name: /real food/i })).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: /build my dog's meal plan/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/cooked this week/i)).toBeInTheDocument();
  });

  it('renders the footer footnote and a skip link', async () => {
    render(<App />);
    expect((await screen.findAllByText(/not veterinary advice/i)).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /skip to content/i })).toBeInTheDocument();
  });
});
