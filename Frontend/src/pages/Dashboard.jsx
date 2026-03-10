import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TicketCard from "../components/TicketCard";
import { getTickets } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  const ESTADOS = [
    { value: "Todos", label: "Todos" },
    { value: "open", label: "Abiertos" },
    { value: "in_progress", label: "En Progreso" },
    { value: "resolved", label: "Cerrados" },
  ];

  const cargarTickets = async () => {
    setLoading(true);
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  const ticketsFiltrados =
    filtro === "Todos" ? tickets : tickets.filter((t) => t.status === filtro);

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        {/* Encabezado */}
        <div className="page-header">
          <h1 className="page-title">
            Dashboard
            <span>— Bienvenido, {user?.full_name}</span>
          </h1>
          <button className="btn btn-ghost btn-sm" onClick={cargarTickets}>
            ↻ Actualizar
          </button>
        </div>

        {/* Stats rápidos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1rem",
            marginBottom: "1.8rem",
          }}
        >
          {ESTADOS.slice(1).map((estado) => (
            <div
              key={estado.value}
              className="card"
              style={{ padding: "1rem", textAlign: "center" }}
            >
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>
                {tickets.filter((t) => t.status === estado.value).length}
              </div>
              <div
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  marginTop: "0.2rem",
                }}
              >
                {estado.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          {ESTADOS.map((e) => (
            <button
              key={e.value}
              onClick={() => setFiltro(e.value)}
              className={`btn btn-sm ${filtro === e.value ? "btn-primary" : "btn-ghost"}`}
            >
              {e.label}
            </button>
          ))}
        </div>

        {/* Tabla */}
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="status-message">
            <p>Cargando tickets...</p>
          </div>
        ) : ticketsFiltrados.length === 0 ? (
          <div className="status-message">
            <h2>Sin tickets</h2>
            <p>No hay tickets con el filtro "{filtro}".</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table>
              <thead>
                <tr>
                  <th>Asunto</th>
                  <th>Estado</th>
                  <th>Impacto</th>
                  <th>Tipo</th>
                  <th>Nivel</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ticketsFiltrados.map((t) => (
                  <TicketCard key={t.ticket_id} ticket={t} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
