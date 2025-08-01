//Reservaciones.tsx
// Importación de hooks de React
import { useEffect, useState } from "react";
// Hooks de navegación y obtención de parámetros desde la URL
import { useParams, useNavigate } from "react-router-dom";
// Librerías para generar PDF
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
// Estilos del componente
import "./Reservaciones.css";
// URL base para acceder al backend
import { BASE_URL } from "../config";

// Definición del tipo de datos que representa una reserva
type Reserva = {
  id_reserva: number;
  fecha_inicio: string;
  hora_inicio: string;
  hora_fin: string;
  estado_reserva: string;
};

// Componente funcional principal
export const Reservaciones: React.FC = () => {
  // Se obtiene el parámetro de la URL (id de la cancha)
  const { idCancha } = useParams<{ idCancha: string }>();
  const navigate = useNavigate();

  // Estado para guardar todas las reservas
  const [reservas, setReservas] = useState<Reserva[]>([]);
  // Estado para guardar el filtro seleccionado (ej. "Pendiente", "Cancelado", etc.)
  const [estadoFiltro, setEstadoFiltro] = useState<string>("Todos");
  // Estado para guardar solo las reservas que cumplen con el filtro
  const [reservasFiltradas, setReservasFiltradas] = useState<Reserva[]>([]);

  // Hook que se ejecuta una vez que el componente se monta o cambia `idCancha`
  useEffect(() => {
    if (!idCancha) return; // Si no hay cancha, no hacemos nada

    // Se realiza una petición POST al servidor para obtener las reservas de la cancha
    fetch(BASE_URL + "reservaciones.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id_cancha: idCancha }).toString(),
    })
      .then((response) => response.text()) // Convertimos la respuesta en texto
      .then((text) => {
        try {
          const data = JSON.parse(text); // Parseamos la respuesta como JSON

          // Si hay un error en la respuesta, lo mostramos en consola
          if (data.error) {
            console.error("Error del servidor:", data.error);
            return;
          }

          // Mapeamos los datos crudos del servidor a objetos del tipo `Reserva`
          const reservasObtenidas: Reserva[] = (data.reservas ?? []).map(
            (item: any) => ({
              id_reserva: item.id_reserva,
              fecha_inicio: item.fecha_inicio,
              hora_inicio: item.hora_inicio,
              hora_fin: item.hora_fin,
              estado_reserva: item.estado_reserva.trim(), // Eliminamos espacios extra
            })
          );

          // Verificamos los estados de reserva recibidos (debugging)
          console.log(
            "Estados de reserva recibidos:",
            reservasObtenidas.map((r) => r.estado_reserva)
          );

          // Guardamos las reservas completas y las filtradas (inicialmente iguales)
          setReservas(reservasObtenidas);
          setReservasFiltradas(reservasObtenidas);
        } catch (jsonError) {
          console.error(
            "Error procesando JSON:",
            jsonError,
            "\nRespuesta recibida:",
            text
          );
        }
      })
      .catch((error) => console.error("Error cargando reservaciones", error));
  }, [idCancha]);

  // Maneja el cambio del filtro de estado (ej. "Pendiente", "Alquilada", etc.)
  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const estadoSeleccionado = e.target.value;
    setEstadoFiltro(estadoSeleccionado);

    // Si se selecciona "Todos", mostramos todas las reservas
    if (estadoSeleccionado === "Todos") {
      setReservasFiltradas(reservas);
    } else {
      // Filtramos las reservas según el estado seleccionado
      setReservasFiltradas(
        reservas.filter(
          (r) =>
            r.estado_reserva.trim().toLowerCase() ===
            estadoSeleccionado.trim().toLowerCase()
        )
      );
    }
  };

  // Función que genera un PDF con la tabla de reservaciones actuales (filtradas)
  const descargarPDF = () => {
    const doc = new jsPDF(); // Crea una nueva instancia de PDF

    // Título del documento
    doc.setFontSize(18);
    doc.text("Reservaciones de Cancha", 14, 20);

    // Definimos las columnas de la tabla
    const tableColumn = ["Fecha Inicio", "Hora Inicio", "Hora Fin", "Estado"];
    // Mapeamos cada reserva filtrada a una fila de la tabla
    const tableRows = reservasFiltradas.map((reserva) => [
      reserva.fecha_inicio,
      reserva.hora_inicio,
      reserva.hora_fin,
      reserva.estado_reserva,
    ]);

    // Generamos la tabla en el PDF
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30, // Altura inicial
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }, // Color de fondo del encabezado
    });

    // Guardamos el archivo con este nombre
    doc.save("reservas_cancha.pdf");
  };

  // -------------------- RENDER DEL COMPONENTE --------------------
  return (
    <div className="container">
      {/* Botón para regresar a la página anterior */}
      <button onClick={() => navigate(-1)} className="boton-volver">
        ← Volver
      </button>

      <h1>Reservaciones de Cancha</h1>

      {/* Filtro por estado de reserva */}
      <div className="filtro-container">
        <label htmlFor="estadoFiltro">Filtrar por estado:&nbsp;</label>
        <select
          id="estadoFiltro"
          value={estadoFiltro}
          onChange={handleFiltroChange}
        >
          <option value="Todos">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Alquilada">Alquilada</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      {/* Botón para descargar PDF */}
      <button onClick={descargarPDF} className="boton-descargar" type="button">
        Descargar PDF
      </button>

      {/* Renderizado de la lista de reservas filtradas */}
      <div>
        {reservasFiltradas.length === 0 ? (
          <p className="no-reservas">No hay reservas</p>
        ) : (
          reservasFiltradas.map((reserva) => (
            // Cada reserva es un botón que redirige al detalle de esa reserva
            <button
              key={reserva.id_reserva}
              type="button"
              className="reserva-card"
              onClick={() => navigate(`/detalle-reserva/${reserva.id_reserva}`)}
            >
              <p>
                <strong>Fecha Inicio:</strong> {reserva.fecha_inicio}
              </p>
              <p>
                <strong>Hora Inicio:</strong> {reserva.hora_inicio}
              </p>
              <p>
                <strong>Hora Fin:</strong> {reserva.hora_fin}
              </p>
              <p>
                <strong>Estado:</strong> {reserva.estado_reserva}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
