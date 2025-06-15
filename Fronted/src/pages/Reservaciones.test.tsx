// Reservaciones.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { Reservaciones } from './Reservaciones';
import * as jspdf from 'jspdf';
import autoTable from 'jspdf-autotable';

vi.mock('jspdf');
vi.mock('jspdf-autotable');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ idCancha: '1' }),
  };
});

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn();
});

test('renderiza reservas correctamente', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    text: () => Promise.resolve(JSON.stringify({
      reservas: [{
        id_reserva: 1,
        fecha_inicio: '2024-01-01',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        estado_reserva: 'Pendiente'
      }]
    })),
  });

  render(
    <MemoryRouter initialEntries={['/reservaciones/1']}>
      <Routes>
        <Route path="/reservaciones/:idCancha" element={<Reservaciones />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    const tarjetas = screen.getAllByRole("button");
    const contiene = tarjetas.some(t => t.textContent?.toLowerCase().includes("pendiente"));
    expect(contiene).toBe(true);
  });
});

test('filtra reservas por estado', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    text: () => Promise.resolve(JSON.stringify({
      reservas: [
        { id_reserva: 1, fecha_inicio: '2024-01-01', hora_inicio: '10:00', hora_fin: '11:00', estado_reserva: 'Pendiente' },
        { id_reserva: 2, fecha_inicio: '2024-01-02', hora_inicio: '12:00', hora_fin: '13:00', estado_reserva: 'Alquilada' }
      ]
    }))
  });

  render(
    <MemoryRouter initialEntries={['/reservaciones/1']}>
      <Routes>
        <Route path="/reservaciones/:idCancha" element={<Reservaciones />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText(/pendiente/i);

  fireEvent.change(screen.getByLabelText(/filtrar por estado/i), {
    target: { value: 'Alquilada' },
  });

  await waitFor(() => {
    const tarjetas = screen.getAllByRole("button");
    const textos = tarjetas.map(btn => btn.textContent?.toLowerCase() || "");
    expect(textos.some(t => t.includes("alquilada"))).toBe(true);
    expect(textos.every(t => !t.includes("pendiente"))).toBe(true);
  });
});

test('muestra mensaje si no hay reservas', async () => {
  (global.fetch as any).mockResolvedValueOnce({
    text: () => Promise.resolve(JSON.stringify({ reservas: [] }))
  });

  render(
    <MemoryRouter initialEntries={['/reservaciones/1']}>
      <Routes>
        <Route path="/reservaciones/:idCancha" element={<Reservaciones />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText(/no hay reservas/i);
});

test('maneja error de red', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  (global.fetch as any).mockRejectedValueOnce(new Error('fallo red'));

  render(
    <MemoryRouter initialEntries={['/reservaciones/1']}>
      <Routes>
        <Route path="/reservaciones/:idCancha" element={<Reservaciones />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(consoleError).toHaveBeenCalledWith(
      'Error cargando reservaciones',
      expect.any(Error)
    );
  });
});

test('genera PDF al hacer clic en descargar', async () => {
  const saveMock = vi.fn();
  (jspdf.jsPDF as any).mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: saveMock,
  }));

  (global.fetch as any).mockResolvedValueOnce({
    text: () => Promise.resolve(JSON.stringify({
      reservas: [{
        id_reserva: 1,
        fecha_inicio: '2024-01-01',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        estado_reserva: 'Pendiente'
      }]
    })),
  });

  render(
    <MemoryRouter initialEntries={['/reservaciones/1']}>
      <Routes>
        <Route path="/reservaciones/:idCancha" element={<Reservaciones />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText(/pendiente/i);
  fireEvent.click(screen.getByText(/descargar pdf/i));
  expect(saveMock).toHaveBeenCalled();
});

test("descargar PDF sin reservas no lanza error", async () => {
  const saveMock = vi.fn();
  (jspdf.jsPDF as any).mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: saveMock,
  }));

  (global.fetch as any).mockResolvedValueOnce({
    text: () => Promise.resolve(JSON.stringify({ reservas: [] })),
  });

  render(
    <MemoryRouter initialEntries={['/reservaciones/1']}>
      <Routes>
        <Route path="/reservaciones/:idCancha" element={<Reservaciones />} />
      </Routes>
    </MemoryRouter>
  );

  const boton = await screen.findByRole("button", { name: /descargar pdf/i });
  fireEvent.click(boton);
  expect(saveMock).toHaveBeenCalled();
});

test("al cambiar a 'Todos' se muestran todas las reservas", async () => {
  (global.fetch as any).mockResolvedValueOnce({
    text: () => Promise.resolve(JSON.stringify({
      reservas: [
        { id_reserva: 1, fecha_inicio: '2024-01-01', hora_inicio: '10:00', hora_fin: '11:00', estado_reserva: 'Pendiente' },
        { id_reserva: 2, fecha_inicio: '2024-01-02', hora_inicio: '12:00', hora_fin: '13:00', estado_reserva: 'Cancelado' }
      ]
    }))
  });

  render(
    <MemoryRouter initialEntries={['/reservaciones/1']}>
      <Routes>
        <Route path="/reservaciones/:idCancha" element={<Reservaciones />} />
      </Routes>
    </MemoryRouter>
  );

  const select = await screen.findByLabelText(/filtrar por estado/i);

  fireEvent.change(select, { target: { value: "Pendiente" } });
  await waitFor(() => {
    const tarjetas = screen.getAllByRole("button");
    const textos = tarjetas.map(btn => btn.textContent?.toLowerCase() || "");
    expect(textos.some(t => t.includes("cancelado"))).toBe(false);
  });

  fireEvent.change(select, { target: { value: "Todos" } });
  await waitFor(() => {
    const tarjetas = screen.getAllByRole("button");
    const textos = tarjetas.map(btn => btn.textContent?.toLowerCase() || "");
    expect(textos.some(t => t.includes("pendiente"))).toBe(true);
    expect(textos.some(t => t.includes("cancelado"))).toBe(true);
  });
});
test('no lanza error al descargar PDF sin reservas', async () => {
  const saveMock = vi.fn();
  (jspdf.jsPDF as any).mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: saveMock,
  }));

  (global.fetch as any).mockResolvedValueOnce({
    text: () => Promise.resolve(JSON.stringify({ reservas: [] }))
  });

  render(
    <MemoryRouter initialEntries={['/reservaciones/1']}>
      <Routes>
        <Route path="/reservaciones/:idCancha" element={<Reservaciones />} />
      </Routes>
    </MemoryRouter>
  );

  const btn = await screen.findByRole("button", { name: /descargar pdf/i });
  fireEvent.click(btn);
  expect(saveMock).toHaveBeenCalled();
});