import { Link } from "react-router-dom";

// Función que deriva el estado visual a partir del status y current_level del DB
const getDisplayStatus = (ticket) => {
  if (ticket.status === "open" && ticket.current_level === 2)
    return { label: "Escalado", cls: "badge-escalado" };
  if (ticket.status === "open")
    return { label: "Abierto", cls: "badge-abierto" };
  if (ticket.status === "in_progress")
    return { label: "En Progreso", cls: "badge-progreso" };
  if (ticket.status === "resolved")
    return { label: "Cerrado", cls: "badge-cerrado" };
  return { label: ticket.status, cls: "badge-abierto" };
};

const IMPACT_COLOR = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
const IMPACT_LABEL = { high: "Alto", medium: "Medio", low: "Bajo" };
const TYPE_LABEL = {
  bug: "Bug",
  feature_request: "Feature Request",
  support: "Soporte",
};

export default function TicketCard({ ticket }) {
  const { label, cls } = getDisplayStatus(ticket);

  return (
    <tr>
      <td style={{ maxWidth: "260px" }}>
        <Link
          to={`/tickets/${ticket.ticket_id}`}
          style={{
            color: "var(--accent)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          {ticket.subject}
        </Link>
      </td>
      <td>
        <span className={`badge ${cls}`}>{label}</span>
      </td>
      <td
        style={{
          color: IMPACT_COLOR[ticket.impact] || "inherit",
          fontWeight: 600,
        }}
      >
        {IMPACT_LABEL[ticket.impact] || ticket.impact}
      </td>
      <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
        {TYPE_LABEL[ticket.type] || ticket.type}
      </td>
      <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
        L{ticket.current_level}
      </td>
      <td style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
        {new Date(ticket.created_at).toLocaleDateString("es-MX")}
      </td>
    </tr>
  );
}
