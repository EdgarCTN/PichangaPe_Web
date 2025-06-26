// RegistrarCancha.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import RegistrarCancha from './RegistrarCancha';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: {
        id_cliente: '123',
        nombre: 'Juan',
        apellido: 'Pérez',
      },
    }),
  };
});

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

function renderComponent() {
  render(
    <MemoryRouter initialEntries={['/registrar-cancha']}>
      <Routes>
        <Route path="/registrar-cancha" element={<RegistrarCancha />} />
      </Routes>
    </MemoryRouter>
  );
}

test('muestra inputs y permite escribir', () => {
  renderComponent();

  fireEvent.change(screen.getByTestId('nombre-cancha'), {
    target: { value: 'Cancha A' },
  });
  fireEvent.change(screen.getByTestId('direccion'), {
    target: { value: 'Av. Siempre Viva' },
  });
  fireEvent.change(screen.getByTestId('hora-inicio'), {
    target: { value: '08:00' },
  });
  fireEvent.change(screen.getByTestId('hora-fin'), {
    target: { value: '22:00' },
  });
  fireEvent.change(screen.getByTestId('fecha-apertura'), {
    target: { value: '2025-01-01' },
  });
  fireEvent.change(screen.getByTestId('costo-por-hora'), {
    target: { value: '50' },
  });

  expect(screen.getByDisplayValue('Cancha A')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Av. Siempre Viva')).toBeInTheDocument();
});

test('valida campos vacíos', () => {
  renderComponent();
  fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

  expect(screen.getAllByText('Campo requerido').length).toBeGreaterThan(0);
});

test('valida costo por hora inválido', () => {
  renderComponent();

  fireEvent.change(screen.getByTestId('nombre-cancha'), {
    target: { value: 'Cancha A' },
  });
  fireEvent.change(screen.getByTestId('direccion'), {
    target: { value: 'Av. 123' },
  });
  fireEvent.change(screen.getByTestId('hora-inicio'), {
    target: { value: '08:00' },
  });
  fireEvent.change(screen.getByTestId('hora-fin'), {
    target: { value: '22:00' },
  });
  fireEvent.change(screen.getByTestId('fecha-apertura'), {
    target: { value: '2025-06-27' },
  });
  fireEvent.change(screen.getByTestId('costo-por-hora'), {
    target: { value: 'abc' },
  });

  fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

  expect(screen.getByText('Debe ser un número positivo')).toBeInTheDocument();
});

test('registra cancha exitosamente', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    json: async () => ({ success: true }),
  });

  renderComponent();

  fireEvent.change(screen.getByTestId('nombre-cancha'), {
    target: { value: 'Cancha Nueva' },
  });
  fireEvent.change(screen.getByTestId('direccion'), {
    target: { value: 'Av. Arequipa' },
  });
  fireEvent.change(screen.getByTestId('hora-inicio'), {
    target: { value: '08:00' },
  });
  fireEvent.change(screen.getByTestId('hora-fin'), {
    target: { value: '20:00' },
  });
  fireEvent.change(screen.getByTestId('fecha-apertura'), {
    target: { value: '2025-06-28' },
  });
  fireEvent.change(screen.getByTestId('costo-por-hora'), {
    target: { value: '70' },
  });

  fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

  await waitFor(() => {
    expect(screen.getByText(/cancha registrada exitosamente/i)).toBeInTheDocument();
  });
});

test('muestra error si registro falla', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    json: async () => ({ success: false, error: 'Duplicado' }),
  });

  renderComponent();

  fireEvent.change(screen.getByTestId('nombre-cancha'), {
    target: { value: 'Cancha B' },
  });
  fireEvent.change(screen.getByTestId('direccion'), {
    target: { value: 'Calle 1' },
  });
  fireEvent.change(screen.getByTestId('hora-inicio'), {
    target: { value: '10:00' },
  });
  fireEvent.change(screen.getByTestId('hora-fin'), {
    target: { value: '18:00' },
  });
  fireEvent.change(screen.getByTestId('fecha-apertura'), {
    target: { value: '2025-07-01' },
  });
  fireEvent.change(screen.getByTestId('costo-por-hora'), {
    target: { value: '80' },
  });

  fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Duplicado');
  });
});

test('muestra error de conexión', async () => {
  (global.fetch as any).mockRejectedValueOnce(new Error('Fallo de red'));

  renderComponent();

  fireEvent.change(screen.getByTestId('nombre-cancha'), {
    target: { value: 'Cancha Error' },
  });
  fireEvent.change(screen.getByTestId('direccion'), {
    target: { value: 'Calle falsa' },
  });
  fireEvent.change(screen.getByTestId('hora-inicio'), {
    target: { value: '09:00' },
  });
  fireEvent.change(screen.getByTestId('hora-fin'), {
    target: { value: '18:00' },
  });
  fireEvent.change(screen.getByTestId('fecha-apertura'), {
    target: { value: '2025-07-03' },
  });
  fireEvent.change(screen.getByTestId('costo-por-hora'), {
    target: { value: '90' },
  });

  fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Error de conexión. Intente nuevamente.');
  });
});

test('botón volver navega a bienvenida', () => {
  renderComponent();
  fireEvent.click(screen.getByRole('button', { name: /volver/i }));

  expect(mockNavigate).toHaveBeenCalledWith('/bienvenida', expect.anything());
});