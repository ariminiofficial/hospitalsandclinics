import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PublicLayout from '../public-site/PublicLayout.jsx';
import { WebsiteProvider } from '../public-site/WebsiteContext.jsx';

vi.mock('../shared/api/client.js', () => ({
  api: {
    get: vi.fn().mockResolvedValue({}),
  },
}));

describe('PublicLayout Component', () => {
  it('renders branding and main navigation links', async () => {
    render(
      <MemoryRouter>
        <WebsiteProvider>
          <PublicLayout />
        </WebsiteProvider>
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Book Online/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Specialists/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/About/i)[0]).toBeInTheDocument();
  });
});
