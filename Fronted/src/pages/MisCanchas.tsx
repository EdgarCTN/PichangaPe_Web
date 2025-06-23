import React, { useState, useEffect, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf"; // Librería para generar archivos PDF
import autoTable from "jspdf-autotable"; // Plugin para crear tablas en el PDF
import "./Bienvenida_MisCanchas.css"; // Estilos del componente
import { BASE_URL } from "../config"; // URL base para las peticiones al backend

// Estructura de una cancha
interface Cancha {
  id_cancha: string;
  nombre: string;
  direccion: string;
  precio_por_hora: string;
  estado: string;
}

// Estado recibido desde otra vista (Bienvenida)
interface LocationState {
  id_cliente: string;
  nombre: string;
  apellido: string;
}

const MisCanchas: React.FC = () => {
  // Obtenemos la información del dueño desde la navegación

  const { state } = useLocation();
  const navigate = useNavigate();
  const { id_cliente, nombre, apellido } = state as LocationState;

  // Estados del componente
  const [lista, setLista] = useState<Cancha[]>([]); // Lista filtrada de canchas
  const [listaFull, setListaFull] = useState<Cancha[]>([]); // Lista completa de canchas
  const [filtro, setFiltro] = useState<string>(""); // Filtro para búsqueda
  const [loading, setLoading] = useState<boolean>(true); // Cargando canchas
  const [mensaje, setMensaje] = useState<string | null>(null); // Mensaje de éxito o error
  const [tipoMensaje, setTipoMensaje] = useState<"éxito" | "error" | null>(
    null
  );
  const [idPendienteEliminar, setIdPendienteEliminar] = useState<string | null>(
    null
  ); // ID de cancha a eliminar

  // Verifica si el dueño tiene sesión activa y carga las canchas

  useEffect(() => {
    if (!id_cliente) {
      navigate("/");
      return;
    }
    fetchDatos();
  }, [id_cliente, navigate]);
  // Limpia el estilo del fondo
  useEffect(() => {
    document.body.style.background = "";
  }, []);
  // Muestra un mensaje temporal (4 segundos)

  const mostrarMensaje = (texto: string, tipo: "éxito" | "error") => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => {
      setMensaje(null);
      setTipoMensaje(null);
    }, 4000);
  };
  // Cargar las canchas del dueño desde el backend

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const res = await fetch(BASE_URL + "CMostrarCancha.php", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id_dueno: id_cliente }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        mostrarMensaje(json.error ?? `Error servidor: ${res.status}`, "error");
        return;
      }
      // Guardamos las canchas recibidas
      setLista(json.canchas ?? []);
      setListaFull(json.canchas ?? []);
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al cargar canchas. Revisa la consola.", "error");
    } finally {
      setLoading(false);
    }
  };
  // Prepara el ID de la cancha para confirmación de eliminación
  const confirmarEliminacion = (id_cancha: string) => {
    setIdPendienteEliminar(id_cancha);
  };
  // Cancela la eliminación
  const cancelarEliminacion = () => {
    setIdPendienteEliminar(null);
  };
  // Ejecuta la eliminación de una cancha confirmada
  const eliminarCanchaConfirmada = async () => {
    if (!idPendienteEliminar) return;
    try {
      const res = await fetch(BASE_URL + "eliminar_cancha.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cancha: idPendienteEliminar }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        mostrarMensaje(json.error ?? "Error al eliminar la cancha.", "error");
      } else {
        mostrarMensaje(json.mensaje, "éxito");
        // Actualizamos listas excluyendo la cancha eliminada

        setLista((prev) =>
          prev.filter((c) => c.id_cancha !== idPendienteEliminar)
        );
        setListaFull((prev) =>
          prev.filter((c) => c.id_cancha !== idPendienteEliminar)
        );
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al intentar eliminar la cancha.", "error");
    } finally {
      setIdPendienteEliminar(null);
    }
  };
  // Cambia el estado de una cancha (activa, inactiva, mantenimiento)

  const cambiarEstadoCancha = async (
    id_cancha: string,
    nuevoEstado: string
  ) => {
    try {
      const res = await fetch(BASE_URL + "cambiar_estado_cancha.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cancha, estado: nuevoEstado }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        mostrarMensaje(json.error ?? "Error al cambiar el estado.", "error");
        return;
      }
      // Actualizamos el estado en ambas listas
      setLista((prev) =>
        prev.map((c) =>
          c.id_cancha === id_cancha ? { ...c, estado: nuevoEstado } : c
        )
      );
      setListaFull((prev) =>
        prev.map((c) =>
          c.id_cancha === id_cancha ? { ...c, estado: nuevoEstado } : c
        )
      );

      mostrarMensaje("Estado actualizado correctamente.", "éxito");
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al actualizar estado de la cancha.", "error");
    }
  };
  // Filtro para buscar por nombre o dirección
  const handleFiltro = (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.toLowerCase();
    setFiltro(valor);
    setLista(
      valor
        ? listaFull.filter(
            (c) =>
              c.nombre.toLowerCase().includes(valor) ||
              c.direccion.toLowerCase().includes(valor)
          )
        : listaFull
    );
  };
  // Estructura para datos de ganancia por cancha
  interface Ganancia {
    nombre: string;
    total: string;
  }
  // Genera un PDF con el reporte de ganancias de las canchas
  const handleReporteGanancias = async () => {
    try {
      // Realiza una petición POST al backend para obtener el reporte de ganancias del dueño
      const res = await fetch(BASE_URL + "CReporteGanancias.php", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id_dueno: id_cliente }),
      });

      const json = await res.json(); // Convierte la respuesta a JSON

      // Verifica si hubo un error en la respuesta del servidor
      if (!res.ok || json.error) {
        mostrarMensaje(json.error ?? "Error al obtener el reporte.", "error");
        return;
      }

      const ganancias = json.ganancias;

      // Si no hay datos disponibles, muestra un mensaje de error
      if (!ganancias || ganancias.length === 0) {
        mostrarMensaje("No hay datos de ganancias disponibles.", "error");
        return;
      }

      // Calcula el total de todas las ganancias sumando el campo 'total' de cada cancha
      const total = ganancias.reduce(
        (acc: number, cancha: Ganancia) => acc + parseFloat(cancha.total),
        0
      );

      // Inicializa el documento PDF
      const doc = new jsPDF();
      doc.setFontSize(18); // Título principal
      doc.text("Reporte de Ganancias", 14, 20);
      doc.setFontSize(12);
      doc.text(`Total General: S/ ${total.toFixed(2)}`, 14, 28); // Total general

      // Verifica si todas las canchas tienen 0 ganancias
      const todasCanchasSinGanancia = ganancias.every(
        (c: Ganancia) => parseFloat(c.total) === 0
      );

      // Si todas las canchas tienen 0, se indica en el reporte y se guarda el PDF
      if (todasCanchasSinGanancia) {
        doc.setFontSize(12);
        doc.setTextColor(150);
        doc.text(
          "⚠️ Todas las canchas tienen 0 ganancias registradas.",
          14,
          38
        );
        doc.save("ReporteGanancias.pdf");
        return;
      }

      // Encuentra la cancha con mayor ganancia
      const canchaMasRentable = ganancias.reduce(
        (prev: Ganancia, curr: Ganancia) =>
          parseFloat(curr.total) > parseFloat(prev.total) ? curr : prev,
        ganancias[0]
      );

      // Define columnas de la tabla del reporte
      const tableColumn = ["Cancha", "Ganancia (S/)"];

      // Mapea los datos de ganancias para usarlos como filas de la tabla
      const tableRows = ganancias.map((cancha: Ganancia) => [
        cancha.nombre,
        parseFloat(cancha.total).toFixed(2),
      ]);

      // Genera la tabla usando autoTable
      autoTable(doc, {
        startY: 35, // Posición Y inicial de la tabla
        head: [tableColumn],
        body: tableRows,
        styles: { fontSize: 11 }, // Estilo general de la tabla
        headStyles: { fillColor: [22, 160, 133] }, // Color de encabezado
        didParseCell: (data) => {
          // Resalta la fila de la cancha más rentable con un color distinto
          if (
            data.row.index !== undefined &&
            ganancias[data.row.index].nombre === canchaMasRentable.nombre
          ) {
            data.cell.styles.fillColor = [22, 160, 133];
          }
        },
      });

      // Obtiene la posición Y final de la tabla para insertar texto adicional debajo
      const finalY = (doc as any).lastAutoTable?.finalY ?? 35;

      // Agrega una anotación sobre la cancha más rentable debajo de la tabla
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `⭐ Cancha más rentable: ${canchaMasRentable.nombre} (S/ ${parseFloat(
          canchaMasRentable.total
        ).toFixed(2)})`,
        14,
        finalY + 10
      );

      // Guarda el archivo PDF
      doc.save("ReporteGanancias.pdf");

      // Muestra mensaje de éxito al usuario
      mostrarMensaje("Reporte generado correctamente.", "éxito");
    } catch (err) {
      // Si ocurre un error inesperado, se captura y muestra un mensaje de error
      console.error(err);
      mostrarMensaje("Error al generar el reporte.", "error");
    }
  };

  // Navega a la vista de reservaciones de una cancha específica
  const handleSeleccionCancha = (cancha: Cancha) => {
    // Redirige a la ruta de reservaciones usando el ID de la cancha
    navigate(`/reservaciones/${cancha.id_cancha}`);
  };

  // Navega al formulario para registrar una nueva cancha
  const handleAgregarCancha = () => {
    // Redirige al formulario y pasa los datos del cliente como estado
    navigate("/registrar-cancha", {
      state: { id_cliente, nombre, apellido },
    });
  };

  return (
    // Contenedor principal de la página de "Mis Canchas"
    <div className="mis-canchas-page">
      {/* Contenedor interno con fondo blanco, sombra y padding */}
      <div className="mis-canchas-container">
        {/* Título de la página */}
        <h2>Mis Canchas Registradas</h2>

        {/* Mensaje emergente de éxito o error, según tipoMensaje */}
        {mensaje && <div className={`mensaje ${tipoMensaje}`}>{mensaje}</div>}

        {/* Modal de confirmación para eliminar una cancha */}
        {idPendienteEliminar && (
          <div className="modal-overlay">
            <div className="modal-content">
              <p>
                ¿Estás seguro de eliminar esta cancha? Esta acción no se puede
                deshacer.
              </p>
              <div className="confirmacion-botones">
                {/* Botón para cancelar eliminación */}
                <button className="btn-cancelar" onClick={cancelarEliminacion}>
                  Cancelar
                </button>
                {/* Botón para confirmar eliminación */}
                <button
                  className="btn-confirmar"
                  onClick={eliminarCanchaConfirmada}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botonera principal: navegación, agregar y reporte */}
        <div className="botones-container">
          {/* Botón para volver a la vista de bienvenida */}
          <button
            onClick={() =>
              navigate("/bienvenida", {
                state: { id_cliente, nombre, apellido },
              })
            }
            className="btn-volver"
          >
            Volver a Bienvenida
          </button>

          {/* Botón para agregar una nueva cancha */}
          <button onClick={handleAgregarCancha} className="btn-agregar">
            Agregar Cancha
          </button>

          {/* Botón para generar el reporte de ganancias */}
          <button onClick={handleReporteGanancias} className="btn-reporte">
            Reporte de Ganancias
          </button>
        </div>

        {/* Input para filtrar las canchas por nombre o dirección */}
        <input
          className="filter-input"
          type="text"
          placeholder="Filtrar por nombre o dirección"
          value={filtro}
          onChange={handleFiltro}
        />

        {/* Indicador de carga mientras se obtienen las canchas */}
        {loading && <p className="loading">Cargando canchas...</p>}

        {/* Lista de canchas si ya se cargaron y hay al menos una */}
        {!loading && lista.length > 0 && (
          <ul className="canchas-list">
            {lista.map((item) => (
              // Tarjeta individual de cada cancha
              <li key={item.id_cancha} className="cancha-card">
                {/* Botón para ver más detalles o reservas de la cancha */}
                <button
                  type="button"
                  className="cancha-info"
                  onClick={() => handleSeleccionCancha(item)}
                >
                  <h3>{item.nombre}</h3>
                  <p>Dirección: {item.direccion}</p>
                  <p>Precio por hora: S/ {item.precio_por_hora}</p>
                  <p>
                    Estado actual: <strong>{item.estado}</strong>
                  </p>
                </button>

                {/* Sección para cambiar estado de la cancha o eliminarla */}
                <div className="cambiar-estado">
                  <label htmlFor={`estado-${item.id_cancha}`}>
                    Cambiar estado:
                  </label>
                  {/* Select para cambiar el estado de la cancha */}
                  <select
                    id={`estado-${item.id_cancha}`}
                    value={item.estado}
                    onChange={(e) =>
                      cambiarEstadoCancha(item.id_cancha, e.target.value)
                    }
                  >
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                  {/* Botón para eliminar la cancha (muestra el modal) */}
                  <button
                    className="btn-eliminar"
                    onClick={() => confirmarEliminacion(item.id_cancha)}
                  >
                    Eliminar cancha
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Mensaje si no hay canchas registradas y ya cargó */}
        {!loading && lista.length === 0 && (
          <p className="empty">No tienes canchas registradas.</p>
        )}
      </div>
    </div>
  );
};
export default MisCanchas;
