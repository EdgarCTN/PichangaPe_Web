// MisCanchas.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import MisCanchas from './MisCanchas';

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

const mockCanchas = {
    canchas: [
        {
            id_cancha: '1',
            nombre: 'Cancha A',
            direccion: 'Av. Lima 123',
            precio_por_hora: '50.00',
        },
        {
            id_cancha: '2',
            nombre: 'Cancha B',
            direccion: 'Calle Sol 456',
            precio_por_hora: '60.00',
        },
    ],
};

beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCanchas,
    });
});

test('muestra título y carga inicial', async () => {
    render(
        <MemoryRouter initialEntries={['/miscanchas']}>
            <Routes>
                <Route path="/miscanchas" element={<MisCanchas />} />
            </Routes>
        </MemoryRouter>
    );

    expect(screen.getByText(/cargando canchas/i)).toBeInTheDocument();
    await screen.findByText('Mis Canchas Registradas');
    expect(screen.getByText('Cancha A')).toBeInTheDocument();
    expect(screen.getByText('Cancha B')).toBeInTheDocument();
});

test('filtra correctamente por nombre o dirección', async () => {
    render(
        <MemoryRouter initialEntries={['/miscanchas']}>
            <Routes>
                <Route path="/miscanchas" element={<MisCanchas />} />
            </Routes>
        </MemoryRouter>
    );

    await screen.findByText('Cancha A');

    const input = screen.getByPlaceholderText(/filtrar/i);
    fireEvent.change(input, { target: { value: 'Sol' } });

    expect(screen.queryByText('Cancha A')).not.toBeInTheDocument();
    expect(screen.getByText('Cancha B')).toBeInTheDocument();
});

test('muestra mensaje si no hay canchas', async () => {
    (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ canchas: [] }),
    });

    render(
        <MemoryRouter initialEntries={['/miscanchas']}>
            <Routes>
                <Route path="/miscanchas" element={<MisCanchas />} />
            </Routes>
        </MemoryRouter>
    );

    await screen.findByText(/no tienes canchas registradas/i);
});

test('navega a registrar cancha', async () => {
    render(
        <MemoryRouter initialEntries={['/miscanchas']}>
            <Routes>
                <Route path="/miscanchas" element={<MisCanchas />} />
            </Routes>
        </MemoryRouter>
    );

    const boton = await screen.findByRole('button', { name: /agregar cancha/i });
    fireEvent.click(boton);
    expect(mockNavigate).toHaveBeenCalledWith('/registrar-cancha', expect.anything());
});

test('navega a bienvenida', async () => {
    render(
        <MemoryRouter initialEntries={['/miscanchas']}>
            <Routes>
                <Route path="/miscanchas" element={<MisCanchas />} />
            </Routes>
        </MemoryRouter>
    );

    const boton = await screen.findByRole('button', { name: /volver a bienvenida/i });
    fireEvent.click(boton);
    expect(mockNavigate).toHaveBeenCalledWith('/bienvenida', expect.anything());
});

test('redirige si no hay id_cliente en location state', async () => {
    vi.resetModules();
    vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
        return {
            ...actual,
            useNavigate: () => mockNavigate,
            useLocation: () => ({ state: undefined }),
        };
    });

    const MisCanchasReload = (await import('./MisCanchas')).default;

    render(
        <MemoryRouter initialEntries={['/miscanchas']}>
            <Routes>
                <Route path="/miscanchas" element={<MisCanchasReload />} />
            </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});

test('muestra alerta si json contiene error', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });
    (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'No autorizado' }),
    });

    render(
        <MemoryRouter initialEntries={['/miscanchas']}>
            <Routes>
                <Route path="/miscanchas" element={<MisCanchas />} />
            </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('No autorizado');
    });
});

test('muestra alerta si respuesta del servidor no es ok', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });
    (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
    });

    render(
        <MemoryRouter initialEntries={['/miscanchas']}>
            <Routes>
                <Route path="/miscanchas" element={<MisCanchas />} />
            </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Error servidor: 500');
    });
});

test('muestra alerta si fetch lanza error', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });
    (global.fetch as any).mockRejectedValueOnce(new Error('fallo de red'));

    render(
        <MemoryRouter initialEntries={['/miscanchas']}>
            <Routes>
                <Route path="/miscanchas" element={<MisCanchas />} />
            </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Error al cargar canchas. Revisa la consola.');
    });
});0

test('navega a reservaciones al hacer click en cancha', async () => {
    render(
        <MemoryRouter initialEntries={['/miscanchas']}>
            <Routes>
                <Route path="/miscanchas" element={<MisCanchas />} />
            </Routes>
        </MemoryRouter>
    );

    await screen.findByText('Cancha A');

    const canchaBtn = screen.getByText('Cancha A').closest('button');
    fireEvent.click(canchaBtn!);

    expect(mockNavigate).toHaveBeenCalledWith('/reservaciones/1');
});
