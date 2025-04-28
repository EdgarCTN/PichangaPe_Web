import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./Reservaciones.css";

type Reserva = {
  id_reserva: number;
  fecha_inicio: string;
  hora_inicio: string;
  hora_fin: string;
  estado_reserva: string;
};

export const Reservaciones: React.FC = () => {
  const { idCancha } = useParams<{ idCancha: string }>();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [estadoFiltro, setEstadoFiltro] = useState<string>("Todos");
  const [reservasFiltradas, setReservasFiltradas] = useState<Reserva[]>([]);

  useEffect(() => {
    if (!idCancha) return;

    fetch(
      "https://739c9dc3-0789-44cf-b9b3-0a433b602be3-00-g7yu9uuhed8k.worf.replit.dev/reservaciones.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id_cancha: idCancha }),
      }
    )
      .then((response) => response.text())
      .then((text) => {
        try {
          const data = JSON.parse(text);

          if (data.error) {
            console.error("Error del servidor:", data.error);
            return;
          }

          const reservasObtenidas: Reserva[] = (data.reservas || []).map(
            (item: any) => ({
              id_reserva: item.id_reserva,
              fecha_inicio: item.fecha_inicio,
              hora_inicio: item.hora_inicio,
              hora_fin: item.hora_fin,
              estado_reserva: item.estado_reserva,
            })
          );

          setReservas(reservasObtenidas);
          setReservasFiltradas(reservasObtenidas);
        } catch (jsonError) {
          console.error("Error procesando JSON:", text);
        }
      })
      .catch((error) => console.error("Error cargando reservaciones", error));
  }, [idCancha]);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const estadoSeleccionado = e.target.value;
    setEstadoFiltro(estadoSeleccionado);

    if (estadoSeleccionado === "Todos") {
      setReservasFiltradas(reservas);
    } else {
      setReservasFiltradas(
        reservas.filter((r) => r.estado_reserva === estadoSeleccionado)
      );
    }
  };

  const descargarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reservaciones de Cancha", 14, 20);

    const tableColumn = ["Fecha Inicio", "Hora Inicio", "Hora Fin", "Estado"];
    const tableRows = reservasFiltradas.map((reserva) => [
      reserva.fecha_inicio,
      reserva.hora_inicio,
      reserva.hora_fin,
      reserva.estado_reserva,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("reservas_cancha.pdf");
  };

  return (
    <div className="container">
      <h1>Reservaciones de Cancha</h1>

      <div className="filtro-container">
        <label htmlFor="estadoFiltro">Filtrar por estado: </label>
        <select
          id="estadoFiltro"
          value={estadoFiltro}
          onChange={handleFiltroChange}
        >
          <option>Todos</option>
          <option>Pendiente</option>
          <option>Alquilada</option>
          <option>Cancelado</option>
        </select>
      </div>

      <button onClick={descargarPDF} className="boton-descargar">
        Descargar PDF
      </button>

      <div>
        {reservasFiltradas.length === 0 ? (
          <p className="no-reservas">No hay reservas</p>
        ) : (
          reservasFiltradas.map((reserva) => (
            <div
              key={reserva.id_reserva}
              className="reserva-card"
              onClick={() => navigate(`/detalle-reserva/${reserva.id_reserva}`)}
              style={{ cursor: "pointer" }}
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};
