import express from 'express';
import { autenticar } from '../middleware/authMiddleware.js';
import pool from '../../Soporte.Infraestructure/basededatos.js';

const router = express.Router();

/**
 * GET /api/customers
 * Devuelve todos los clientes ordenados por nombre de empresa.
 */
router.get('/', autenticar, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT nit, company_name, contact_email FROM customers ORDER BY company_name ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener customers:', err.message);
        res.status(500).json({ message: err.message });
    }
});

export default router;
