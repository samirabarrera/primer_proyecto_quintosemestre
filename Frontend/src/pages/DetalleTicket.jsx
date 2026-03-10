import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getTicketById,
  actualizarTicket,
  escalarTicket,
  ponerEnProgreso,
  cerrarTicket,
  descargarPDF,
} from "../api/api";

const TIPOS = ["bug", "feature_request", "support"];
const IMPACTOS = ["high", "medium", "low"];

const TYPE_LABEL = {
  bug: "Bug",
  feature_request: "Feature Request",
  support: "Soporte",
};
const IMPACT_LABEL = { high: "Alto", medium: "Medio", low: "Bajo" };

// Deriva el estado visual a partir de status y current_level (mismo criterio que TicketCard)
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

export default function DetalleTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [actionError, setActionError] = useState("");
  const [showEscalarModal, setShowEscalarModal] = useState(false);
  const [comentario, setComentario] = useState("");
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState({});

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getTicketById(id);
      setTicket(data);
      setEditForm({
        subject: data.subject,
        description: data.description || "",
        type: data.type,
        impact: data.impact,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [id]);

  const doAction = async (fn, msg) => {
    setActionMsg("");
    setActionError("");
    try {
      await fn();
      setActionMsg(msg);
      cargar();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleEscalar = async (e) => {
    e.preventDefault();
    await doAction(
      () => escalarTicket(id, comentario),
      "Ticket escalado a L2 exitosamente.",
    );
    setShowEscalarModal(false);
    setComentario("");
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    await doAction(
      () => actualizarTicket(id, editForm),
      "Ticket actualizado correctamente.",
    );
    setEditando(false);
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="status-message">
          <p>Cargando ticket...</p>
        </div>
      </>
    );
  if (error)
    return (
      <>
        <Navbar />
        <div className="status-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </>
    );
  if (!ticket) return null;

  const { label: statusLabel, cls: statusCls } = getDisplayStatus(ticket);
  const esCerrado = ticket.status === "resolved";
  const esEscalado = ticket.current_level === 2;
  const esEnProgreso = ticket.status === "in_progress";

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">Detalle del Ticket</h1>
            <span
              className={`badge ${statusCls}`}
              style={{ marginTop: "0.3rem", display: "inline-block" }}
            >
              {statusLabel}
            </span>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("/")}
          >
            ← Volver
          </button>
        </div>

        {actionMsg && <div className="alert alert-success">{actionMsg}</div>}
        {actionError && <div className="alert alert-error">{actionError}</div>}

        <div className="card">
          {!editando ? (
            <>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Asunto</label>
                  <p style={{ fontWeight: 600 }}>{ticket.subject}</p>
                </div>
                <div className="detail-item">
                  <label>Tipo</label>
                  <p>{TYPE_LABEL[ticket.type] || ticket.type}</p>
                </div>
                <div className="detail-item">
                  <label>Impacto</label>
                  <p>{IMPACT_LABEL[ticket.impact] || ticket.impact}</p>
                </div>
                <div className="detail-item">
                  <label>Nivel Actual</label>
                  <p>L{ticket.current_level}</p>
                </div>
                <div className="detail-item">
                  <label>Creado</label>
                  <p>{new Date(ticket.created_at).toLocaleString("es-MX")}</p>
                </div>
                <div className="detail-item">
                  <label>Última actualización</label>
                  <p>{new Date(ticket.updated_at).toLocaleString("es-MX")}</p>
                </div>
              </div>
              {ticket.description && (
                <div style={{ marginTop: "0.5rem" }}>
                  <label
                    style={{
                      fontSize: "0.78rem",
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Comentario
                  </label>
                  <p
                    style={{
                      marginTop: "0.4rem",
                      lineHeight: 1.7,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {ticket.description}
                  </p>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleGuardarEdicion}>
              <div className="form-group">
                <label>Asunto</label>
                <input
                  value={editForm.subject}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, subject: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Comentario</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, type: e.target.value }))
                    }
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {TYPE_LABEL[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Impacto</label>
                  <select
                    value={editForm.impact}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, impact: e.target.value }))
                    }
                  >
                    {IMPACTOS.map((i) => (
                      <option key={i} value={i}>
                        {IMPACT_LABEL[i]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  Guardar cambios
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditando(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Barra de acciones */}
          {!editando && (
            <div className="actions-bar">
              {/* L1: editar si no está cerrado */}
              {user.role === "level1" && !esCerrado && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditando(true)}
                >
                  Editar
                </button>
              )}
              {/* L1: escalar si está en nivel 1 y no cerrado */}
              {user.role === "level1" && !esEscalado && !esCerrado && (
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => setShowEscalarModal(true)}
                >
                  Escalar a L2
                </button>
              )}
              {/* L2: poner en progreso si está escalado y no en progreso */}
              {user.role === "level2" &&
                esEscalado &&
                !esEnProgreso &&
                !esCerrado && (
                  <button
                    className="btn btn-sm"
                    style={{ background: "#38bdf8", color: "#000" }}
                    onClick={() =>
                      doAction(() => ponerEnProgreso(id), "Ticket en progreso.")
                    }
                  >
                    En Progreso
                  </button>
                )}
              {/* L1 y L2: cerrar */}
              {!esCerrado && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() =>
                    doAction(() => cerrarTicket(id), "Ticket cerrado.")
                  }
                >
                  ✕ Cerrar Ticket
                </button>
              )}
              {/* PDF: siempre */}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  descargarPDF(id).catch((e) => setActionError(e.message))
                }
              >
              Descargar PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Escalar */}
      {showEscalarModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "1rem",
          }}
        >
          <div className="card" style={{ width: "100%", maxWidth: "480px" }}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
              Escalar Ticket a L2
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.88rem",
                marginBottom: "1.2rem",
              }}
            >
              Debes incluir un comentario técnico explicando por qué se escala.
            </p>
            <form onSubmit={handleEscalar}>
              <div className="form-group">
                <label>Comentario técnico *</label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Ej: Se requiere acceso al servidor para revisar logs..."
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="submit" className="btn btn-warning btn-sm">
                  Confirmar Escalado
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowEscalarModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}