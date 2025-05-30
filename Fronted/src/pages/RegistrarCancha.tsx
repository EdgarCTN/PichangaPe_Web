// RegistrarCancha.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RegistrarCancha.css";

interface LocationState {
  id_cliente: string;
  nombre: string;
  apellido: string;
}

const URL_REGISTRAR_CANCHA =
  "https://b2497ce8-dcb5-473c-bec0-4eeb60091278-00-n0byecpxlij6.picard.replit.dev/agregar.php";

const RegistrarCancha: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id_cliente, nombre, apellido } = state as LocationState;

  const [nombreCancha, setNombreCancha] = useState<string>("");
  const [direccion, setDireccion] = useState<string>("");
  const [horasDisponibles, setHorasDisponibles] = useState<string>("");
  const [fechasDisponibles, setFechasDisponibles] = useState<string>("");
  const [costoPorHora, setCostoPorHora] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("Fútbol");
  const [loading, setLoading] = useState<boolean>(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensajeExito, setMensajeExito] = useState<string>("");

  useEffect(() => {
    if (!id_cliente) {
      navigate("/");
    }
  }, [id_cliente, navigate]);

  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(""), 4000); // 4 segundos
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const validarCampos = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!nombreCancha.trim()) {
      nuevosErrores.nombreCancha = "Campo requerido";
    }

    if (!direccion.trim()) {
      nuevosErrores.direccion = "Campo requerido";
    }

    const horaRegex = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/;
    if (!horasDisponibles.trim()) {
      nuevosErrores.horasDisponibles = "Campo requerido";
    } else {
      const match = horasDisponibles.trim().match(horaRegex);
      if (!match) {
        nuevosErrores.horasDisponibles =
          "Formato inválido. Usa el formato HH:MM - HH:MM (ej. 08:00 - 22:00)";
      } else {
        const [, hInicioStr, mInicioStr, hFinStr, mFinStr] = match;
        const hInicio = parseInt(hInicioStr, 10);
        const mInicio = parseInt(mInicioStr, 10);
        const hFin = parseInt(hFinStr, 10);
        const mFin = parseInt(mFinStr, 10);

        const esHoraValida = (h: number, m: number) =>
          h >= 0 && h < 24 && m >= 0 && m < 60;

        if (!esHoraValida(hInicio, mInicio) || !esHoraValida(hFin, mFin)) {
          nuevosErrores.horasDisponibles =
            "Hora inválida. Debe estar entre 00:00 y 23:59.";
        } else {
          const inicioMin = hInicio * 60 + mInicio;
          const finMin = hFin * 60 + mFin;

          if (inicioMin >= finMin) {
            nuevosErrores.horasDisponibles =
              "La hora de inicio debe ser anterior a la hora de fin.";
          }
        }
      }
    }

    const fechaRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!fechasDisponibles.trim()) {
      nuevosErrores.fechasDisponibles = "Campo requerido";
    } else if (!fechaRegex.test(fechasDisponibles.trim())) {
      nuevosErrores.fechasDisponibles = "Formato inválido (ej. 27/04/2025)";
    } else {
      const [dia, mes, anio] = fechasDisponibles.split("/").map(Number);
      const fechaIngresada = new Date(anio, mes - 1, dia);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaIngresada < hoy) {
        nuevosErrores.fechasDisponibles = "Debe ser una fecha futura";
      }
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
      params.append("horasDisponibles", horasDisponibles.trim());
      params.append("fechas_abiertas", fechasDisponibles.trim());
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
    setErrores({});
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

        {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}

        <input
          type="text"
          placeholder="Nombre de la cancha"
          value={nombreCancha}
          onChange={(e) => setNombreCancha(e.target.value)}
        />
        {errores.nombreCancha && (
          <span className="error">{errores.nombreCancha}</span>
        )}

        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
        {errores.direccion && (
          <span className="error">{errores.direccion}</span>
        )}

        <input
          type="text"
          placeholder="Horario (ej. 08:00 - 22:00)"
          value={horasDisponibles}
          onChange={(e) => setHorasDisponibles(e.target.value)}
        />
        {errores.horasDisponibles && (
          <span className="error">{errores.horasDisponibles}</span>
        )}

        <input
          type="text"
          placeholder="Fecha de apertura (ej. 27/04/2025)"
          value={fechasDisponibles}
          onChange={(e) => setFechasDisponibles(e.target.value)}
        />
        {errores.fechasDisponibles && (
          <span className="error">{errores.fechasDisponibles}</span>
        )}

        <input
          type="text"
          placeholder="Costo por hora"
          value={costoPorHora}
          onChange={(e) => setCostoPorHora(e.target.value)}
        />
        {errores.costoPorHora && (
          <span className="error">{errores.costoPorHora}</span>
        )}

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
