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

  fireEvent.change(screen.getByPlaceholderText(/nombre de la cancha/i), {
    target: { value: 'Cancha A' },
  });
  fireEvent.change(screen.getByPlaceholderText(/dirección/i), {
    target: { value: 'Av. Siempre Viva' },
  });
  fireEvent.change(screen.getByPlaceholderText(/horas en las que opera/i), {
    target: { value: '8:00 - 22:00' },
  });
  fireEvent.change(screen.getByPlaceholderText(/fecha de apertura/i), {
    target: { value: '01/01/2025' },
  });
  fireEvent.change(screen.getByPlaceholderText(/costo por hora/i), {
    target: { value: '50' },
  });

  expect(screen.getByDisplayValue('Cancha A')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Av. Siempre Viva')).toBeInTheDocument();
});

test('valida campos vacíos', () => {
  renderComponent();
  const boton = screen.getByRole('button', { name: /registrar/i });
  fireEvent.click(boton);
  expect(window.alert).toHaveBeenCalledWith('Por favor, complete todos los campos');
});

test('valida costo por hora inválido', () => {
  renderComponent();
  fireEvent.change(screen.getByPlaceholderText(/nombre de la cancha/i), {
    target: { value: 'Cancha A' },
  });
  fireEvent.change(screen.getByPlaceholderText(/dirección/i), {
    target: { value: 'Av. 123' },
  });
  fireEvent.change(screen.getByPlaceholderText(/horas en las que opera/i), {
    target: { value: '8:00 - 22:00' },
  });
  fireEvent.change(screen.getByPlaceholderText(/fecha de apertura/i), {
    target: { value: '27/06/2025' },
  });
  fireEvent.change(screen.getByPlaceholderText(/costo por hora/i), {
    target: { value: 'abc' }, // inválido
  });

  const boton = screen.getByRole('button', { name: /registrar/i });
  fireEvent.click(boton);
  expect(window.alert).toHaveBeenCalledWith('El costo por hora debe ser un número válido');
});

test('registra cancha exitosamente', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    json: async () => ({ success: true, message: 'Registrado' }),
  });

  renderComponent();

  fireEvent.change(screen.getByPlaceholderText(/nombre de la cancha/i), {
    target: { value: 'Cancha Nueva' },
  });
  fireEvent.change(screen.getByPlaceholderText(/dirección/i), {
    target: { value: 'Av. Arequipa' },
  });
  fireEvent.change(screen.getByPlaceholderText(/horas en las que opera/i), {
    target: { value: '8:00 - 20:00' },
  });
  fireEvent.change(screen.getByPlaceholderText(/fecha de apertura/i), {
    target: { value: '28/06/2025' },
  });
  fireEvent.change(screen.getByPlaceholderText(/costo por hora/i), {
    target: { value: '70' },
  });

  const boton = screen.getByRole('button', { name: /registrar/i });
  fireEvent.click(boton);

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Registrado');
  });
});

test('muestra error si registro falla', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    json: async () => ({ success: false, error: 'Duplicado' }),
  });

  renderComponent();

  fireEvent.change(screen.getByPlaceholderText(/nombre de la cancha/i), {
    target: { value: 'Cancha B' },
  });
  fireEvent.change(screen.getByPlaceholderText(/dirección/i), {
    target: { value: 'Calle 1' },
  });
  fireEvent.change(screen.getByPlaceholderText(/horas en las que opera/i), {
    target: { value: '10:00 - 18:00' },
  });
  fireEvent.change(screen.getByPlaceholderText(/fecha de apertura/i), {
    target: { value: '01/07/2025' },
  });
  fireEvent.change(screen.getByPlaceholderText(/costo por hora/i), {
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

  fireEvent.change(screen.getByPlaceholderText(/nombre de la cancha/i), {
    target: { value: 'Cancha Error' },
  });
  fireEvent.change(screen.getByPlaceholderText(/dirección/i), {
    target: { value: 'Calle falsa' },
  });
  fireEvent.change(screen.getByPlaceholderText(/horas en las que opera/i), {
    target: { value: '9:00 - 18:00' },
  });
  fireEvent.change(screen.getByPlaceholderText(/fecha de apertura/i), {
    target: { value: '03/07/2025' },
  });
  fireEvent.change(screen.getByPlaceholderText(/costo por hora/i), {
    target: { value: '90' },
  });

  fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Error de conexión. Intente nuevamente.');
  });
});

test('botón volver navega a bienvenida', () => {
  renderComponent();

  const botonVolver = screen.getByRole('button', { name: /volver/i });
  fireEvent.click(botonVolver);

  expect(mockNavigate).toHaveBeenCalledWith('/bienvenida', expect.anything());
});