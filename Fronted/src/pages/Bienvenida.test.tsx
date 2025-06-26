import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import Bienvenida from './Bienvenida';

// Simula la respuesta del servidor
const mockCanchas = [
  {
    id_cancha: '1',
    nombre: 'Cancha A',
    ganancias: '100.00',
    total_reservas: 10,
    total_reservas_pagadas: 8,
  },
  {
    id_cancha: '2',
    nombre: 'Cancha B',
    ganancias: '150.00',
    total_reservas: 12,
    total_reservas_pagadas: 10,
  },
];

beforeEach(() => {
  // Mock global fetch
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockCanchas,
  });
});
test('muestra saludo con nombre y apellido', async () => {
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/bienvenida',
          state: { id_cliente: '123', nombre: 'Juan', apellido: 'Pérez' },
        },
      ]}
    >
      <Routes>
        <Route path="/bienvenida" element={<Bienvenida />} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(/cargando estadísticas/i)).toBeInTheDocument();

  await waitFor(() =>
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Juan Pérez')
  );
});

test('muestra lista de canchas después de cargar', async () => {
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/bienvenida',
          state: { id_cliente: '123', nombre: 'Ana', apellido: 'López' },
        },
      ]}
    >
      <Routes>
        <Route path="/bienvenida" element={<Bienvenida />} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(/cargando estadísticas/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Cancha A')).toBeInTheDocument();
    expect(screen.getByText('Cancha B')).toBeInTheDocument();
  });
});

test('filtra canchas correctamente', async () => {
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/bienvenida',
          state: { id_cliente: '123', nombre: 'Carlos', apellido: 'Ramírez' },
        },
      ]}
    >
      <Routes>
        <Route path="/bienvenida" element={<Bienvenida />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText('Cancha A'); // espera que se cargue

  const input = screen.getByPlaceholderText(/filtrar por nombre/i);
  fireEvent.change(input, { target: { value: 'B' } });

  expect(screen.queryByText('Cancha A')).not.toBeInTheDocument();
  expect(screen.getByText('Cancha B')).toBeInTheDocument();
});

test('muestra mensaje si no hay canchas', async () => {
  // Mocks sin canchas
  (global.fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );

  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/bienvenida',
          state: { id_cliente: '123', nombre: 'Luis', apellido: 'Suárez' },
        },
      ]}
    >
      <Routes>
        <Route path="/bienvenida" element={<Bienvenida />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText(/no tienes estadísticas registradas/i);
});

test('muestra alerta si respuesta del servidor no es ok', async () => {
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  (global.fetch as any).mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: async () => ({}),
  });

  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/bienvenida',
          state: { id_cliente: '123', nombre: 'Mario', apellido: 'Gómez' },
        },
      ]}
    >
      <Routes>
        <Route path="/bienvenida" element={<Bienvenida />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalled();
  });
});

test('muestra alerta si fetch lanza error', async () => {
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  (global.fetch as any).mockRejectedValueOnce(new Error('Fallo de red'));

  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/bienvenida',
          state: { id_cliente: '123', nombre: 'Rosa', apellido: 'Núñez' },
        },
      ]}
    >
      <Routes>
        <Route path="/bienvenida" element={<Bienvenida />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith(
      'Error al cargar estadísticas. Revisa la consola.'
    );
  });
});
test('redirige al hacer clic en una cancha', async () => {
render(
<MemoryRouter
initialEntries={[
{
pathname: '/bienvenida',
state: { id_cliente: '123', nombre: 'Carmen', apellido: 'Díaz' },
},
]}
>
<Routes>
<Route path="/bienvenida" element={<Bienvenida />} />
<Route path="/reservaciones/:id" element={<div>Reservaciones</div>} />
</Routes>
</MemoryRouter>
);

await screen.findByText('Cancha A');
fireEvent.click(screen.getByText('Cancha A'));
await screen.findByText('Reservaciones');
});

test('redirige al hacer clic en "Ir a Mis Canchas"', async () => {
render(
<MemoryRouter
initialEntries={[
{
pathname: '/bienvenida',
state: { id_cliente: '123', nombre: 'Lucía', apellido: 'Peralta' },
},
]}
>
<Routes>
<Route path="/bienvenida" element={<Bienvenida />} />
<Route path="/miscanchas" element={<div>Mis Canchas</div>} />
</Routes>
</MemoryRouter>
);

fireEvent.click(screen.getByRole('button', { name: /ir a mis canchas/i }));
await screen.findByText('Mis Canchas');
});

test('redirige al hacer clic en "Cerrar sesión"', async () => {
render(
<MemoryRouter
initialEntries={[
{
pathname: '/bienvenida',
state: { id_cliente: '123', nombre: 'Diego', apellido: 'Salas' },
},
]}
>
<Routes>
<Route path="/" element={<div>Inicio</div>} />
<Route path="/bienvenida" element={<Bienvenida />} />
</Routes>
</MemoryRouter>
);

fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));
await screen.findByText('Inicio');
});