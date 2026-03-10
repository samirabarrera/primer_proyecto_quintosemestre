import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Soporte de Tickets
      </Link>

      <div className="navbar-user">
        <div className="navbar-info">
          <strong>{user?.full_name}</strong>
          <span className="role-badge" style={{ marginLeft: "0.5rem" }}>
            {user?.role}
          </span>
        </div>

        {user?.role === "level1" && (
          <Link to="/tickets/nuevo" className="btn btn-primary btn-sm">
            + Nuevo Ticket
          </Link>
        )}

        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
