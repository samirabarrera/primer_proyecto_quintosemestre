import express from 'express';
import { autenticar } from '../middleware/authMiddleware.js';
import pool from '../../Soporte.Infraestructure/basededatos.js';

const router = express.Router();

/**
 * GET /api/products
 * Devuelve todos los productos ordenados por nombre.
 */
router.get('/', autenticar, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT product_id, product_name, description FROM products ORDER BY product_name ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener products:', err.message);
        res.status(500).json({ message: err.message });
    }
});

export default router;
