import pool from '../../Soporte.Infraestructure/basededatos.js';

export const autenticar = async (req, res, next) => {
    const userId = req.header('User-ID');

    if (!userId) {
        return res.status(401).json({
            message: 'Acceso denegado. Debe incluir el header "User-ID" con su ID de usuario.'
        });
    }

    try {
        const result = await pool.query(
            'SELECT user_id, full_name, email, role FROM users WHERE user_id = $1 AND deleted_at IS NULL',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        req.user = result.rows[0]; // { user_id, full_name, email, role }
        next();
    } catch (error) {
        console.error('Error en autenticación:', error.message);
        res.status(500).json({ message: 'Error de autenticación' });
    }
};

/**
 * Middleware después de autenticar qué tipo de usuario es (L1 o L2) para permitir o denegar acceso a ciertas rutas.
 */
export const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.role)) {
            return res.status(403).json({
                message: `Acceso denegado. Esta acción requiere rol: ${rolesPermitidos.join(' o ')}.`
            });
        }
        next();
    };
};
