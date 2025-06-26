// RegistrarCancha.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RegistrarCancha.css";
import { BASE_URL } from "../config";

interface LocationState {
  id_cliente: string;
  nombre: string;
  apellido: string;
}

const URL_REGISTRAR_CANCHA = BASE_URL + "agregar.php";

const RegistrarCancha: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id_cliente, nombre, apellido } = state as LocationState;

  const [nombreCancha, setNombreCancha] = useState("");
  const [direccion, setDireccion] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [fechaApertura, setFechaApertura] = useState("");
  const [costoPorHora, setCostoPorHora] = useState("");
  const [categoria, setCategoria] = useState("Fútbol");

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    if (!id_cliente) navigate("/");
  }, [id_cliente, navigate]);

  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const formatearFecha = (fechaISO: string): string => {
    const [año, mes, dia] = fechaISO.split("-");
    return `${dia}/${mes}/${año}`;
  };

  const validarCampos = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!nombreCancha.trim()) nuevosErrores.nombreCancha = "Campo requerido";
    if (!direccion.trim()) nuevosErrores.direccion = "Campo requerido";

    if (!horaInicio || !horaFin) {
      nuevosErrores.horasDisponibles = "Debe ingresar ambas horas";
    } else if (horaInicio >= horaFin) {
      nuevosErrores.horasDisponibles =
        "La hora de inicio debe ser anterior a la hora de fin.";
    }

    if (!fechaApertura) {
      nuevosErrores.fechasDisponibles = "Debe seleccionar una fecha";
    } else {
      const fechaIngresada = new Date(fechaApertura);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaIngresada < hoy)
        nuevosErrores.fechasDisponibles = "Debe ser una fecha futura";
    }

    const costo = parseFloat(costoPorHora);
    if (!costoPorHora.trim()) {
      nuevosErrores.costoPorHora = "Campo requerido";
    } else if (isNaN(costo) || costo <= 0) {
      nuevosErrores.costoPorHora = "Debe ser un número positivo";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
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
      params.append("horasDisponibles", `${horaInicio} - ${horaFin}`);
      params.append("fechas_abiertas", formatearFecha(fechaApertura));
      params.append("estado", "activa");

      const res = await fetch(URL_REGISTRAR_CANCHA, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      const data = await res.json();
      if (data.success) {
        setMensajeExito("✔️ Cancha registrada exitosamente.");
        limpiarCampos();
      } else {
        alert(data.error ?? "Ocurrió un error desconocido");
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
    setHoraInicio("");
    setHoraFin("");
    setFechaApertura("");
    setCostoPorHora("");
    setCategoria("Fútbol");
    setErrores({});
  };

  const handleRegresar = () => {
    navigate("/bienvenida", { state: { id_cliente, nombre, apellido } });
  };

  return (
    <div className="registrar-cancha-page">
      <div className="registrar-cancha-container">
        <h2>Registrar Nueva Cancha</h2>

        {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}

        <input
          type="text"
          placeholder="Nombre de la cancha"
          value={nombreCancha}
          onChange={(e) => setNombreCancha(e.target.value)}
          data-testid="nombre-cancha"
        />
        {errores.nombreCancha && (
          <span className="error">{errores.nombreCancha}</span>
        )}

        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          data-testid="direccion"
        />
        {errores.direccion && (
          <span className="error">{errores.direccion}</span>
        )}

        <label htmlFor="hora-inicio">Horario disponible:</label>
        <div className="horario-inputs">
          <input
            id="hora-inicio"
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            data-testid="hora-inicio"
          />
          <span>a</span>
          <input
            id="hora-fin"
            type="time"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            data-testid="hora-fin"
          />
        </div>
        {errores.horasDisponibles && (
          <span className="error">{errores.horasDisponibles}</span>
        )}

        <label htmlFor="fecha-apertura">Fecha de apertura:</label>
        <input
          id="fecha-apertura"
          type="date"
          value={fechaApertura}
          onChange={(e) => setFechaApertura(e.target.value)}
          data-testid="fecha-apertura"
        />
        {errores.fechasDisponibles && (
          <span className="error">{errores.fechasDisponibles}</span>
        )}

        <input
          type="text"
          placeholder="Costo por hora"
          value={costoPorHora}
          onChange={(e) => setCostoPorHora(e.target.value)}
          data-testid="costo-por-hora"
        />
        {errores.costoPorHora && (
          <span className="error">{errores.costoPorHora}</span>
        )}

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          data-testid="categoria"
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