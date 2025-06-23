// RegistrarCancha.tsx
// Importaciones desde React y React Router
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RegistrarCancha.css"; // Estilos del formulario
import { BASE_URL } from "../config";

// Interfaz que define el tipo del objeto recibido por navegación
interface LocationState {
  id_cliente: string;
  nombre: string;
  apellido: string;
}

// URL del endpoint para registrar una cancha nueva
const URL_REGISTRAR_CANCHA = BASE_URL + "agregar.php";

// Componente funcional
const RegistrarCancha: React.FC = () => {
  // Recuperar información pasada por navegación (datos del dueño)
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id_cliente, nombre, apellido } = state as LocationState;

  // Estados para capturar los datos del formulario
  const [nombreCancha, setNombreCancha] = useState<string>("");
  const [direccion, setDireccion] = useState<string>("");
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFin, setHoraFin] = useState<string>("");
  const [fechaApertura, setFechaApertura] = useState<string>("");
  const [costoPorHora, setCostoPorHora] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("Fútbol"); // Valor por defecto

  const [loading, setLoading] = useState<boolean>(false); // Controla botón mientras registra
  const [errores, setErrores] = useState<Record<string, string>>({}); // Errores de validación
  const [mensajeExito, setMensajeExito] = useState<string>(""); // Mensaje de éxito

  // Si no hay id_cliente (usuario no autenticado), redirigir
  useEffect(() => {
    if (!id_cliente) {
      navigate("/");
    }
  }, [id_cliente, navigate]);

  // Temporizador para ocultar mensaje de éxito después de unos segundos
  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(""), 4000);
      return () => clearTimeout(timer); // Limpieza del temporizador
    }
  }, [mensajeExito]);

  // Función para convertir fecha de formato YYYY-MM-DD a DD/MM/YYYY
  const formatearFecha = (fechaISO: string): string => {
    const [año, mes, dia] = fechaISO.split("-");
    return `${dia}/${mes}/${año}`;
  };

  // Validación completa del formulario antes de enviarlo
  const validarCampos = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    // Validaciones básicas campo por campo
    if (!nombreCancha.trim()) {
      nuevosErrores.nombreCancha = "Campo requerido";
    }

    if (!direccion.trim()) {
      nuevosErrores.direccion = "Campo requerido";
    }

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

    // Aplicar errores encontrados
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0; // Retorna true si no hay errores
  };

  // Función principal que registra la cancha
  const registrarCancha = async () => {
    // Si hay errores, detener ejecución
    if (!validarCampos()) return;

    setLoading(true); // Mostrar estado de carga

    try {
      // Prepara los datos a enviar
      const params = new URLSearchParams();
      params.append("id_dueno", id_cliente);
      params.append("nombre", nombreCancha.trim());
      params.append("direccion", direccion.trim());
      params.append("precio_por_hora", costoPorHora.trim());
      params.append("tipoCancha", categoria.toLowerCase());
      params.append("horasDisponibles", `${horaInicio} - ${horaFin}`);
      params.append("fechas_abiertas", formatearFecha(fechaApertura));
      params.append("estado", "activa"); // Valor por defecto

      // Envío al servidor
      const res = await fetch(URL_REGISTRAR_CANCHA, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      // Interpretar respuesta
      const data = await res.json();
      if (data.success) {
        setMensajeExito("✔️ Cancha registrada exitosamente.");
        limpiarCampos(); // Limpia el formulario si fue exitoso
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

  // Limpia todos los campos del formulario
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

  // Botón para regresar a la pantalla de bienvenida
  const handleRegresar = () => {
    navigate("/bienvenida", {
      state: { id_cliente, nombre, apellido },
    });
  };

  // ------------------ RENDERIZADO DEL FORMULARIO ------------------

  return (
    <div className="registrar-cancha-page">
      <div className="registrar-cancha-container">
        <h2>Registrar Nueva Cancha</h2>

        {/* Mensaje si el registro fue exitoso */}
        {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}

        {/* Campos de entrada + errores si hay */}
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

        {/* Horario disponible */}
        <label htmlFor="hora-inicio">Horario disponible:</label>
        <div className="horario-inputs">
          <input
            id="hora-inicio"
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
          />
          <span>a</span>
          <input
            id="hora-fin"
            type="time"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
          />
        </div>
        {errores.horasDisponibles && (
          <span className="error">{errores.horasDisponibles}</span>
        )}

        {/* Fecha de apertura */}
        <label htmlFor="fecha-apertura">Fecha de apertura:</label>
        <input
          id="fecha-apertura"
          type="date"
          value={fechaApertura}
          onChange={(e) => setFechaApertura(e.target.value)}
        />
        {errores.fechasDisponibles && (
          <span className="error">{errores.fechasDisponibles}</span>
        )}

        {/* Costo por hora */}
        <input
          type="text"
          placeholder="Costo por hora"
          value={costoPorHora}
          onChange={(e) => setCostoPorHora(e.target.value)}
        />
        {errores.costoPorHora && (
          <span className="error">{errores.costoPorHora}</span>
        )}

        {/* Selección del tipo de cancha */}
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="Fútbol">Fútbol</option>
          <option value="Vóley">Vóley</option>
          <option value="Básquet">Básquet</option>
          <option value="Futsal">Futsal</option>
        </select>

        {/* Botones para volver y registrar */}
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

// Exportación del componente
export default RegistrarCancha;
