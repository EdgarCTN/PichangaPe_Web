// Por ahora ignoren esto, el programa esta bien

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MisCanchas from "./MisCanchas";

// Mockear useLocation y useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    state: { id_cliente: "123" },
  }),
  useNavigate: () => jest.fn(),
}));

describe("MisCanchas Component", () => {
  test("renders the title correctly", () => {
    render(
      <MemoryRouter>
        <MisCanchas />
      </MemoryRouter>
    );

    // Verificamos que el título esté en pantalla
    const titleElement = screen.getByText(/Mis Canchas Registradas/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("renders the filter input", () => {
    render(
      <MemoryRouter>
        <MisCanchas />
      </MemoryRouter>
    );

    // Verificamos que haya un input de filtro
    const inputElement = screen.getByPlaceholderText(
      /Filtrar por nombre o dirección/i
    );
    expect(inputElement).toBeInTheDocument();
  });
});
