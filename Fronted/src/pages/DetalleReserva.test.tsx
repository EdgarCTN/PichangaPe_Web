import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import DetalleReserva from './DetalleReserva';

const mockNavigate = vi.fn();

const mockParams = { idReserva: '123' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

const mockDetalle = {
  fecha: '2025-06-09',
  hora_inicio: '10:00',
  hora_fin: '11:00',
  nombre_reservador: 'Juan',
  apellido_reservador: 'Pérez',
  celular: '987654321',
  estado_reserva: 'Pendiente',
};

beforeEach(() => {
  vi.restoreAllMocks();
  mockParams.idReserva = '123';
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(JSON.stringify(mockDetalle)),
  });
});

test('muestra componente de carga', async () => {
  render(
    <MemoryRouter initialEntries={['/detalle/123']}>
      <Routes>
        <Route path="/detalle/:idReserva" element={<DetalleReserva />} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(/cargando detalles/i)).toBeInTheDocument();
  await screen.findByText(/Detalle de Reserva/i);
});

test('muestra los detalles correctamente', async () => {
  render(
    <MemoryRouter initialEntries={['/detalle/123']}>
      <Routes>
        <Route path="/detalle/:idReserva" element={<DetalleReserva />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText(/Detalle de Reserva/i);
  expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
  expect(screen.getByText(/987654321/)).toBeInTheDocument();
});

test('navega al comprobar', async () => {
  render(
    <MemoryRouter initialEntries={['/detalle/123']}>
      <Routes>
        <Route path="/detalle/:idReserva" element={<DetalleReserva />} />
      </Routes>
    </MemoryRouter>
  );

  const boton = await screen.findByText(/verificar comprobante/i);
  fireEvent.click(boton);
  expect(mockNavigate).toHaveBeenCalledWith('/verificar-comprobante/123');
});

test('muestra error si fetch falla', async () => {
  (global.fetch as any).mockRejectedValueOnce(new Error('fallo de red'));

  render(
    <MemoryRouter initialEntries={['/detalle/123']}>
      <Routes>
        <Route path="/detalle/:idReserva" element={<DetalleReserva />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText(/error/i);
  expect(screen.getByText(/fallo de red/i)).toBeInTheDocument();
});

test('muestra error si respuesta vacía', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    text: () => Promise.resolve(''),
  });

  render(
    <MemoryRouter initialEntries={['/detalle/123']}>
      <Routes>
        <Route path="/detalle/:idReserva" element={<DetalleReserva />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText(/respuesta vacía/i);
});

test('redirige si no hay idReserva', async () => {
  mockParams.idReserva = undefined as any; // Simula que no viene el parámetro

  const DetalleReservaReload = (await import('./DetalleReserva')).default;

  render(
    <MemoryRouter initialEntries={['/detalle']}>
      <Routes>
        <Route path="/detalle" element={<DetalleReservaReload />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
});
test('muestra error si respuesta JSON contiene error', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({ error: 'algo salió mal' })),
  });

  render(
    <MemoryRouter initialEntries={['/detalle/123']}>
      <Routes>
        <Route path="/detalle/:idReserva" element={<DetalleReserva />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText(/algo salió mal/i);
});

test('muestra error si respuesta no es JSON válida', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    text: () => Promise.resolve('--- respuesta no válida ---'),
  });

  render(
    <MemoryRouter initialEntries={['/detalle/123']}>
      <Routes>
        <Route path="/detalle/:idReserva" element={<DetalleReserva />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText(/respuesta inesperada/i); // O el texto que usas en ese catch
});

test('muestra mensaje por defecto si no hay datos', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({})), // JSON vacío
  });

  render(
    <MemoryRouter initialEntries={['/detalle/123']}>
      <Routes>
        <Route path="/detalle/:idReserva" element={<DetalleReserva />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText(/no se encontraron datos/i);
});