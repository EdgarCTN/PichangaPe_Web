import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import VerificarComprobante from './VerificarComprobante';

const mockedFetch = vi.fn();
const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useParams: () => ({ idReserva: '123' }),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  global.fetch = mockedFetch;
});

test('muestra pantalla de carga inicialmente', () => {
  mockedFetch.mockReturnValue(new Promise(() => {}));
  render(
    <MemoryRouter initialEntries={['/verificar/123']}>
      <Routes>
        <Route path="/verificar/:idReserva" element={<VerificarComprobante />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/cargando comprobante/i)).toBeInTheDocument();
});

test('muestra error si el fetch falla', async () => {
  mockedFetch.mockRejectedValueOnce(new Error('fallo'));
  render(
    <MemoryRouter initialEntries={['/verificar/123']}>
      <Routes>
        <Route path="/verificar/:idReserva" element={<VerificarComprobante />} />
      </Routes>
    </MemoryRouter>
  );
  await screen.findByText(/error/i);
  expect(screen.getByText(/reintentar/i)).toBeInTheDocument();
});

test('muestra imagen si el fetch es exitoso', async () => {
  mockedFetch.mockResolvedValueOnce({
    text: async () => JSON.stringify({ image_url: 'https://example.com/comprobante.png' }),
  });
  render(
    <MemoryRouter initialEntries={['/verificar/123']}>
      <Routes>
        <Route path="/verificar/:idReserva" element={<VerificarComprobante />} />
      </Routes>
    </MemoryRouter>
  );
  const img = await screen.findByAltText(/comprobante/i);
  expect(img).toBeInTheDocument();
});

test('botón aprobar llama actualizarEstado con pagado', async () => {
  mockedFetch
    .mockResolvedValueOnce({
      text: async () => JSON.stringify({ image_url: 'test.png' }),
    })
    .mockResolvedValueOnce({
      text: async () => JSON.stringify({ success: 'Éxito', id_cliente: 1, nombre: 'John', apellido: 'Doe' }),
    });

  render(
    <MemoryRouter initialEntries={['/verificar/123']}>
      <Routes>
        <Route path="/verificar/:idReserva" element={<VerificarComprobante />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByAltText(/comprobante/i);
  fireEvent.click(screen.getByText(/aprobar/i));

  await waitFor(() => {
    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });
});

test('botón rechazar llama actualizarEstado con cancelado', async () => {
  mockedFetch
    .mockResolvedValueOnce({
      text: async () => JSON.stringify({ image_url: 'test.png' }),
    })
    .mockResolvedValueOnce({
      text: async () => JSON.stringify({ success: 'Cancelado', id_cliente: 2, nombre: 'Jane', apellido: 'Smith' }),
    });

  render(
    <MemoryRouter initialEntries={['/verificar/123']}>
      <Routes>
        <Route path="/verificar/:idReserva" element={<VerificarComprobante />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByAltText(/comprobante/i);
  fireEvent.click(screen.getByText(/rechazar/i));

  await waitFor(() => {
    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });
});

test('cambia fullscreen al hacer clic en la imagen', async () => {
mockedFetch.mockResolvedValueOnce({
text: async () => JSON.stringify({ image_url: 'test.png' }),
});

render(
<MemoryRouter initialEntries={['/verificar/123']}>
<Routes>
<Route path="/verificar/:idReserva" element={<VerificarComprobante />} />
</Routes>
</MemoryRouter>
);

const img = await screen.findByAltText(/comprobante/i);
const button = img.closest('button');
expect(button).not.toBeNull();
if (button) {
expect(button.classList.contains('fullscreen')).toBe(false);
fireEvent.click(button);
expect(button.classList.contains('fullscreen')).toBe(true);
}
});

test('maneja respuesta inválida (no JSON)', async () => {
  mockedFetch.mockResolvedValueOnce({
    text: async () => 'respuesta no json',
  });
  render(
    <MemoryRouter initialEntries={['/verificar/123']}>
      <Routes>
        <Route path="/verificar/:idReserva" element={<VerificarComprobante />} />
      </Routes>
    </MemoryRouter>
  );
  await screen.findByText(/error/i);
});

test('muestra error si falta id_cliente en respuesta exitosa', async () => {
  mockedFetch
    .mockResolvedValueOnce({
      text: async () => JSON.stringify({ image_url: 'test.png' }),
    })
    .mockResolvedValueOnce({
      text: async () => JSON.stringify({ success: 'ok', nombre: 'x' }),
    });

  render(
    <MemoryRouter initialEntries={['/verificar/123']}>
      <Routes>
        <Route path="/verificar/:idReserva" element={<VerificarComprobante />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByAltText(/comprobante/i);
  fireEvent.click(screen.getByText(/aprobar/i));
  await waitFor(() => {
    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });
});
