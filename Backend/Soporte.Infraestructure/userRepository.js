import pool from "./basededatos.js";

export const crearUsuario = async (userData) => {
  const query = `
        INSERT INTO users (user_id, full_name, email, password_hash, password_salt, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id, full_name, email, role, created_at;
    `;

  const values = [
    userData.userId,
    userData.fullName,
    userData.email,
    userData.passwordHash,
    userData.passwordSalt,
    userData.role,
  ];

  const result = await pool.query(query, values);
  return result.rows[0]; // Retorna los datos sin la contraseña ni la sal
};

export const obtenerPorEmail = async (email) => {
  const query = `
        SELECT user_id, full_name, email, password_hash, password_salt, role 
        FROM users 
        WHERE email = $1 AND deleted_at IS NULL;
    `;

  const result = await pool.query(query, [email]);
  return result.rows[0];
};
