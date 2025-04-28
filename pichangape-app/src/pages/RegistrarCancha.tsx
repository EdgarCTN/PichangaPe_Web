// RegistrarCancha.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RegistrarCancha.css";

interface LocationState {
  id_cliente: string;
  nombre: string;
  apellido: string;
}

const URL_REGISTRAR_CANCHA =
  "https://739c9dc3-0789-44cf-b9b3-0a433b602be3-00-g7yu9uuhed8k.worf.replit.dev/agregar.php";

const RegistrarCancha: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id_cliente, nombre, apellido } = state as LocationState;

  const [nombreCancha, setNombreCancha] = useState("");
  const [direccion, setDireccion] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState("");
  const [fechasDisponibles, setFechasDisponibles] = useState("");
  const [costoPorHora, setCostoPorHora] = useState("");
  const [categoria, setCategoria] = useState("Fútbol");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id_cliente) {
      navigate("/");
    }
  }, [id_cliente, navigate]);

  const validarCampos = (): boolean => {
    if (
      !nombreCancha.trim() ||
      !direccion.trim() ||
      !horasDisponibles.trim() ||
      !fechasDisponibles.trim() ||
      !costoPorHora.trim()
    ) {
      alert("Por favor, complete todos los campos");
      return false;
    }
    if (isNaN(Number(costoPorHora))) {
      alert("El costo por hora debe ser un número válido");
      return false;
    }
    return true;
  };

  const registrarCancha = async () => {
    if (!validarCampos()) return;

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("id_dueno", id_cliente);
      params.append("nombre", nombreCancha.trim());
      params.append("direccion", direccion.trim());
      params.append("precio_por_hora", costoPorHora.trim());
      params.append("tipoCancha", categoria.toLowerCase());
      params.append("horasDisponibles", horasDisponibles.trim());
      params.append("fechas_abiertas", fechasDisponibles.trim());
      params.append("estado", "activa");

      const res = await fetch(URL_REGISTRAR_CANCHA, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      const data = await res.json();
      console.log("Respuesta servidor:", data);

      if (data.success) {
        alert(data.message || "Cancha registrada exitosamente");
        limpiarCampos();
      } else {
        alert(data.error || "Ocurrió un error desconocido");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const limpiarCampos = () => {
    setNombreCancha("");
    setDireccion("");
    setHorasDisponibles("");
    setFechasDisponibles("");
    setCostoPorHora("");
    setCategoria("Fútbol");
  };

  const handleRegresar = () => {
    navigate("/bienvenida", {
      state: { id_cliente, nombre, apellido },
    });
  };

  return (
    <div className="registrar-cancha-page">
      <div className="registrar-cancha-container">
        <h2>Registrar Nueva Cancha</h2>

        <input
          type="text"
          placeholder="Nombre de la cancha"
          value={nombreCancha}
          onChange={(e) => setNombreCancha(e.target.value)}
        />

        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />

        <input
          type="text"
          placeholder="Horas en las que opera la cancha (ejemplo 8:00 - 22:00)"
          value={horasDisponibles}
          onChange={(e) => setHorasDisponibles(e.target.value)}
        />

        <input
          type="text"
          placeholder="Fecha de apertura (ejemplo 27/04/2025)"
          value={fechasDisponibles}
          onChange={(e) => setFechasDisponibles(e.target.value)}
        />

        <input
          type="text"
          placeholder="Costo por hora"
          value={costoPorHora}
          onChange={(e) => setCostoPorHora(e.target.value)}
        />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="Fútbol">Fútbol</option>
          <option value="Vóley">Vóley</option>
          <option value="Básquet">Básquet</option>
          <option value="Futsal">Futsal</option>
        </select>

        <div className="botones">
          <button onClick={handleRegresar} className="btn-volver">
            Volver
          </button>
          <button
            onClick={registrarCancha}
            disabled={loading}
            className="btn-registrar"
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrarCancha;
