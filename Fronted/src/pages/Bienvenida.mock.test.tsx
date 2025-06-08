// Bienvenida.mock.test.tsx
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, test, expect } from 'vitest';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({}), // sin state
  };
});

const Bienvenida = (await import('./Bienvenida')).default;

test('redirecciona al inicio si no hay state', async () => {
  render(
    <MemoryRouter initialEntries={['/bienvenida']}>
      <Routes>
        <Route path="/bienvenida" element={<Bienvenida />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
