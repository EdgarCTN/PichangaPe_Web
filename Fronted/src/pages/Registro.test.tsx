import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Registro from './Registro';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

const fillCampos = () => {
  fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'juan123' } });
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'clave123' } });
  fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Juan' } });
  fireEvent.change(screen.getByPlaceholderText('Apellido'), { target: { value: 'Pérez' } });
  fireEvent.change(screen.getByPlaceholderText('Celular'), { target: { value: '987654321' } });
  fireEvent.change(screen.getByPlaceholderText('Correo'), { target: { value: 'juan@mail.com' } });
  fireEvent.change(screen.getByPlaceholderText('Documento'), { target: { value: '12345678' } });

  const selects = screen.getAllByRole('combobox');
  fireEvent.change(selects[0], { target: { value: 'DNI' } });       // tipoDoc
  fireEvent.change(selects[1], { target: { value: 'cliente' } });   // rol

  const fechaInput = document.querySelector('input[type="date"]') as HTMLInputElement;
  fireEvent.change(fechaInput, { target: { value: '2000-01-01' } });
};

test('registro exitoso', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    text: () => Promise.resolve(JSON.stringify({ success: true })),
  });

  render(<MemoryRouter><Registro /></MemoryRouter>);
  fillCampos();
  fireEvent.click(screen.getByText(/crear cuenta/i));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Usuario registrado con éxito.');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

test('valida campos vacíos', async () => {
  render(<MemoryRouter><Registro /></MemoryRouter>);
  fireEvent.click(screen.getByText(/crear cuenta/i));
  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Por favor, complete todos los campos.');
  });
});

test('muestra error del servidor', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    text: () => Promise.resolve(JSON.stringify({ error: 'Usuario ya existe' })),
  });

  render(<MemoryRouter><Registro /></MemoryRouter>);
  fillCampos();
  fireEvent.click(screen.getByText(/crear cuenta/i));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Usuario ya existe');
  });
});

test('maneja respuesta no JSON', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    text: () => Promise.resolve('no es json'),
  });

  render(<MemoryRouter><Registro /></MemoryRouter>);
  fillCampos();
  fireEvent.click(screen.getByText(/crear cuenta/i));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Respuesta inválida del servidor.');
  });
});

test('maneja error de conexión', async () => {
  (global.fetch as any).mockRejectedValueOnce(new Error('fallo red'));

  render(<MemoryRouter><Registro /></MemoryRouter>);
  fillCampos();
  fireEvent.click(screen.getByText(/crear cuenta/i));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Error de conexión con el servidor.');
  });
});

test('botón volver navega al login', () => {
  render(<MemoryRouter><Registro /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: /volver al login/i }));
  expect(mockNavigate).toHaveBeenCalledWith('/');
});
