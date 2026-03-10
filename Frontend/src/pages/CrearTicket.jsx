import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { crearTicket, getCustomers, getProducts } from "../api/api";

// ENUM ticket_type en Datagrip
const TIPOS = [
  { value: "bug", label: "Bug" },
  { value: "feature_request", label: "Feature Request" },
  { value: "support", label: "Soporte" },
];

// ENUM ticket_impact en Datagrip
const IMPACTOS = [
  { value: "high", label: "Alto" },
  { value: "medium", label: "Medio" },
  { value: "low", label: "Bajo" },
];

export default function CrearTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "",
    description: "",
    type: "",
    impact: "",
    customer_id: "",
    product_id: "",
  });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar clientes y productos
  useEffect(() => {
    Promise.all([getCustomers(), getProducts()])
      .then(([cust, prod]) => {
        setCustomers(cust);
        setProducts(prod);
      })
      .catch((err) => setError("Error al cargar datos: " + err.message))
      .finally(() => setLoadingData(false));
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id) {
      setError("Debes seleccionar un cliente.");
      return;
    }
    if (!form.product_id) {
      setError("Debes seleccionar un producto.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const ticket = await crearTicket(form);
      navigate(`/tickets/${ticket.ticket_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Crear Nuevo Ticket</h1>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("/")}
          >
            ← Volver
          </button>
        </div>

        <div className="card" style={{ maxWidth: "640px" }}>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Fila: Cliente + Producto */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label>Cliente *</label>
                {loadingData ? (
                  <select disabled>
                    <option>Cargando...</option>
                  </select>
                ) : (
                  <select
                    name="customer_id"
                    value={form.customer_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">— Selecciona —</option>
                    {customers.map((c) => (
                      <option key={c.nit} value={c.nit}>
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Producto *</label>
                {loadingData ? (
                  <select disabled>
                    <option>Cargando...</option>
                  </select>
                ) : (
                  <select
                    name="product_id"
                    value={form.product_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">— Selecciona —</option>
                    {products.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Asunto *</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Describe brevemente el problema"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Comentario</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detalla el problema, pasos para reproducirlo, etc."
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
                <label>Tipo *</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Selecciona —</option>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Impacto *</label>
                <select
                  name="impact"
                  value={form.impact}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Selecciona —</option>
                  {IMPACTOS.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || loadingData}
              >
                {loading ? "Creando..." : "Crear Ticket"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate("/")}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
