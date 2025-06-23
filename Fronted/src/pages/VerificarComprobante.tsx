// VerificarComprobante.tsx
// Importación de hooks y herramientas de React
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Para acceder al ID de la URL y redireccionar
import "./VerificarComprobante.css"; // Estilos del componente
import { BASE_URL } from "../config"; // URL base de la API

// Endpoints de la API
const API_FETCH_VOUCHER = BASE_URL + "obtener_voucher.php";
const API_UPDATE_STATE = BASE_URL + "actualizar_estado_reserva.php";

// Componente principal
const VerificarComprobante: React.FC = () => {
  // Obtener el parámetro de la URL: id de la reserva
  const { idReserva } = useParams<{ idReserva: string }>();
  const navigate = useNavigate(); // Hook para navegación programática

  // Estados del componente
  const [imageUrl, setImageUrl] = useState<string>(""); // URL de la imagen del comprobante
  const [loading, setLoading] = useState<boolean>(true); // Carga de datos
  const [error, setError] = useState<string>(""); // Mensaje de error
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false); // Ver imagen a pantalla completa
  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false); // Deshabilitar botones después de aprobar/rechazar
  const [estadoReserva, setEstadoReserva] = useState<string>("pendiente"); // Estado actual de la reserva
  const [mensajeResultado, setMensajeResultado] = useState<string>(""); // Mensaje visual después de acción

  // Función para obtener el comprobante desde la API
  const fetchVoucher = useCallback(async () => {
    // Validar si se obtuvo el id de reserva
    if (!idReserva) {
      setError("No se recibió el ID de reserva.");
      setLoading(false);
      return;
    }

    // Resetear estados
    setLoading(true);
    setError("");
    setMensajeResultado("");

    try {
      // Petición a la API
      const response = await fetch(API_FETCH_VOUCHER, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({ id_reserva: idReserva }).toString(),
      });

      const text = await response.text(); // Obtener texto de respuesta
      let json;
      try {
        json = JSON.parse(text); // Intentar convertir a JSON
      } catch {
        console.error("Respuesta no JSON:", text);
        throw new Error("Error en la respuesta del servidor.");
      }

      // Manejo de errores de la API
      if (json.error) {
        throw new Error(json.error);
      }

      // Mostrar imagen del comprobante
      setImageUrl(json.image_url);

      // Estado actual de la reserva (pagado, cancelado o pendiente)
      if (json.estado) {
        setEstadoReserva(json.estado);

        if (json.estado === "pagado") {
          setMensajeResultado("✅ Comprobante aprobado previamente.");
          setButtonsDisabled(true);
        } else if (json.estado === "cancelado") {
          setMensajeResultado("❌ Comprobante rechazado previamente.");
          setButtonsDisabled(true);
        } else if (json.estado === "pendiente") {
          setMensajeResultado("");
          setButtonsDisabled(false);
        }
      }
    } catch (err) {
      // Captura de errores
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false); // Finaliza carga
    }
  }, [idReserva]);

  // Función para actualizar el estado de la reserva (aprobar o rechazar)
  const actualizarEstado = async (nuevoEstado: "pagado" | "cancelado") => {
    if (!idReserva) return;

    // Resetear estados
    setLoading(true);
    setError("");
    setMensajeResultado("");

    try {
      const response = await fetch(API_UPDATE_STATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          id_reserva: idReserva,
          estado: nuevoEstado,
        }).toString(),
      });

      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        console.error("Respuesta no JSON:", text);
        throw new Error("Error en la respuesta del servidor.");
      }

      // Si la API devuelve error
      if (json.error) {
        setError(json.error);
      }
      // Si la acción fue exitosa
      else if (json.success) {
        // Mostrar mensaje visual
        setMensajeResultado(
          nuevoEstado === "pagado"
            ? "✅ Comprobante aprobado correctamente."
            : "❌ Comprobante rechazado correctamente."
        );
        setButtonsDisabled(true); // Deshabilitar botones tras acción
        setEstadoReserva(nuevoEstado); // Actualizar estado

        const idCliente = json.id_cliente;
        const nombre = json.nombre ?? "";
        const apellido = json.apellido ?? "";

        if (!idCliente) {
          setError("No se obtuvo id_cliente");
          return;
        }

        // Redirigir después de 2 segundos a pantalla de bienvenida
        setTimeout(() => {
          navigate("/bienvenida", {
            state: {
              id_cliente: idCliente,
              nombre,
              apellido,
            },
          });
        }, 2000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError("Error al actualizar estado: " + message);
    } finally {
      setLoading(false);
    }
  };

  // Alterna entre modo pantalla completa y normal para la imagen
  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  // Efecto inicial: carga el comprobante al montar el componente
  useEffect(() => {
    fetchVoucher();
  }, [fetchVoucher]);

  // Mostrar pantalla de carga mientras se obtienen los datos
  if (loading) {
    return (
      <div className="verificar-container">
        <div className="verificar-card">
          <p className="verificar-loading">Cargando comprobante...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de error si ocurrió un problema
  if (error) {
    return (
      <div className="verificar-container">
        <div className="verificar-card">
          <p className="verificar-error">Error: {error}</p>
          <button className="verificar-retry-button" onClick={fetchVoucher}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div className="verificar-container">
      <div className="verificar-card">
        {/* Botón para volver a la pantalla anterior */}
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Volver a Detalle
        </button>

        {/* Título con el ID de la reserva */}
        <h2 className="verificar-title">Comprobante de Reserva #{idReserva}</h2>

        {/* Imagen del comprobante (click para agrandar) */}
        <button
          type="button"
          className={`verificar-image-container ${
            isFullScreen ? "fullscreen" : ""
          }`}
          onClick={toggleFullScreen}
        >
          <img src={imageUrl} alt="Comprobante" className="verificar-image" />
        </button>

        {/* Mensaje visual del estado actual */}
        {mensajeResultado && (
          <p
            style={{
              marginTop: "20px",
              fontWeight: "bold",
              color: estadoReserva === "pagado" ? "green" : "red",
            }}
          >
            {mensajeResultado}
          </p>
        )}

        {/* Mostrar botones solo si está pendiente y no pantalla completa */}
        {!isFullScreen && !buttonsDisabled && estadoReserva === "pendiente" && (
          <div className="verificar-buttons">
            <button
              className="verificar-button cancelar"
              onClick={() => actualizarEstado("cancelado")}
              disabled={buttonsDisabled}
            >
              Rechazar
            </button>

            <button
              className="verificar-button aprobar"
              onClick={() => actualizarEstado("pagado")}
              disabled={buttonsDisabled}
            >
              Aprobar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificarComprobante;
