import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, test, beforeEach, expect } from 'vitest';
import { act } from 'react-dom/test-utils';
import Registro from './Registro';

const mockNavigate = vi.fn();

// Mock de useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Reset de mocks antes de cada test
beforeEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  global.fetch = vi.fn();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

const fillCampos = () => {
  fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'juan123' } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'clave123' } });
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan' } });
  fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Pérez' } });
  fireEvent.change(screen.getByLabelText('Celular'), { target: { value: '987654321' } });
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'juan@mail.com' } });
  fireEvent.change(screen.getByLabelText('Documento'), { target: { value: '12345678' } });
  fireEvent.change(screen.getByLabelText('Tipo de documento'), { target: { value: 'DNI' } });
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-01-01' } });
  fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 'cliente' } });
};

test('registro exitoso', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    status: 200,
    text: () => Promise.resolve(JSON.stringify({ success: true })),
  });

  render(<MemoryRouter><Registro /></MemoryRouter>);
  fillCampos();
  fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

  // Espera el mensaje de éxito
  await waitFor(() => {
    expect(screen.getByText('Usuario registrado con éxito.')).toBeInTheDocument();
  });

  // Espera hasta que navigate("/") haya sido llamado
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/');
  }, { timeout: 3000 });
}, 15000);


// ✅ Test campos vacíos
test('valida campos vacíos', async () => {
  render(<MemoryRouter><Registro /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

  await waitFor(() => {
    expect(screen.getByText('Por favor, complete todos los campos.')).toBeInTheDocument();
  });
}, 10000);

// ✅ Test error de servidor
test('muestra error del servidor', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    status: 400,
    text: () => Promise.resolve(JSON.stringify({ error: 'Usuario ya existe' })),
  });

  render(<MemoryRouter><Registro /></MemoryRouter>);
  fillCampos();
  fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

  await waitFor(() => {
    expect(screen.getByText('Usuario ya existe')).toBeInTheDocument();
  });
}, 10000);

// ✅ Test respuesta no JSON
test('maneja respuesta no JSON', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    status: 200,
    text: () => Promise.resolve('no es json'),
  });

  render(<MemoryRouter><Registro /></MemoryRouter>);
  fillCampos();
  fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

  await waitFor(() => {
    expect(screen.getByText('Respuesta inválida del servidor.')).toBeInTheDocument();
  });
}, 10000);

// ✅ Test error de conexión
test('maneja error de conexión', async () => {
  (global.fetch as any).mockRejectedValueOnce(new Error('fallo red'));

  render(<MemoryRouter><Registro /></MemoryRouter>);
  fillCampos();
  fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

  await waitFor(() => {
    expect(screen.getByText('Error de conexión con el servidor.')).toBeInTheDocument();
  });
}, 10000);

// ✅ Navegación al login
test('botón volver navega al login', () => {
  render(<MemoryRouter><Registro /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: /volver al login/i }));
  expect(mockNavigate).toHaveBeenCalledWith('/');
});
