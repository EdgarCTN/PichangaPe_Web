import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock de useNavigate
const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe("Login Component", () => {
  const renderLogin = () =>
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

  beforeEach(() => {
    vi.clearAllMocks(); // Limpia los mocks antes de cada test
  });

  it("renderiza los campos y botones correctamente", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("Usuario")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Entrar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Registrarse/i })).toBeInTheDocument();
  });

  it("muestra mensaje si usuario está vacío", () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));
    expect(screen.getByText("Ingrese su usuario y contraseña.")).toBeInTheDocument();
  });

  it("muestra mensaje si contraseña está vacía", () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText("Usuario"), {
      target: { value: "ejemplo" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));
    expect(screen.getByText("Ingrese su contraseña.")).toBeInTheDocument();
  });

  it("redirige si el login es exitoso con rol dueño", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              rol: "dueño",
              id_cliente: "1",
              nombre: "Juan",
              apellido: "Pérez",
            })
          ),
      } as Response)
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Usuario"), {
      target: { value: "juan" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/Bienvenida", {
        state: {
          id_cliente: "1",
          nombre: "Juan",
          apellido: "Pérez",
        },
      });
    });
  });

  it("muestra error si el rol no es dueño", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              rol: "cliente",
            })
          ),
      } as Response)
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Usuario"), {
      target: { value: "pepe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "5678" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));

    await waitFor(() => {
      expect(screen.getByText("Acceso denegado. No eres dueño.")).toBeInTheDocument();
    });
  });
});
