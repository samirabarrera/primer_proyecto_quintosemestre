import pool from '../Soporte.Infraestructure/basededatos.js';
import crypto from 'crypto';
import { crearResumenPdf } from '../Soporte.Infraestructure/pdfGenerator.js';

// ENUMs de la DB
const STATUS_OPEN        = 'open';
const STATUS_IN_PROGRESS = 'in_progress';
const STATUS_RESOLVED    = 'resolved';

/**
 * L1: Crea un nuevo ticket. Estado inicial: 'open', nivel: 1.
 */
export const crearTicket = async (ticketData, usuarioId) => {
    const { subject, description, type, impact, product_id } = ticketData;
    if (!subject || !type || !impact) {
        throw new Error('Todos los campos son obligatorios.');
    }
    if (!product_id) throw new Error('Debe seleccionar un producto.');

    const ticketId = crypto.randomUUID();
    const query = `
        INSERT INTO tickets (ticket_id, product_id, assigned_user_id, subject, description, type, impact, status, current_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
        RETURNING *;
    `;
    const result = await pool.query(query, [ticketId, product_id, usuarioId, subject, description || null, type, impact, STATUS_OPEN]);
    return result.rows[0];
};

/**
 * L1: Edita un ticket existente.
 */
export const actualizarTicket = async (ticketId, ticketData) => {
    const { subject, description, type, impact } = ticketData;
    const query = `
        UPDATE tickets
        SET subject      = COALESCE($1, subject),
            description  = COALESCE($2, description),
            type         = COALESCE($3, type),
            impact       = COALESCE($4, impact),
            updated_at   = CURRENT_TIMESTAMP
        WHERE ticket_id = $5 AND deleted_at IS NULL
        RETURNING *;
    `;
    const result = await pool.query(query, [subject, description, type, impact, ticketId]);
    if (result.rows.length === 0) throw new Error('Ticket no encontrado.');
    return result.rows[0];
};


// L1: Escala a L2. Cambia current_level a 2, status permanece 'open'.
export const escalar = async (ticketId, comentarioTecnico, usuarioId) => {
    if (!comentarioTecnico || comentarioTecnico.trim() === '') {
        throw new Error('Se debe incluir un comentario técnico para escalar el ticket.');
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const updateQuery = `
            UPDATE tickets
            SET current_level = 2, updated_at = CURRENT_TIMESTAMP
            WHERE ticket_id = $1 AND status != $2 AND deleted_at IS NULL
            RETURNING *;
        `;
        const ticketResult = await client.query(updateQuery, [ticketId, STATUS_RESOLVED]);
        if (ticketResult.rows.length === 0) {
            throw new Error('Ticket no encontrado. No se puede escalar un ticket cerrado o eliminado.');
        }

        const commentId = crypto.randomUUID();
        await client.query(
            'INSERT INTO comments (comment_id, ticket_id, user_id, content) VALUES ($1, $2, $3, $4)',
            [commentId, ticketId, usuarioId, comentarioTecnico]
        );

        await client.query('COMMIT');
        return ticketResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

//L2: Pone el ticket en progreso. Solo si está escalado en nivel 2.
export const ponerEnProgreso = async (ticketId) => {
    const query = `
        UPDATE tickets
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE ticket_id = $2 AND current_level = 2 AND status = $3 AND deleted_at IS NULL
        RETURNING *;
    `;
    const result = await pool.query(query, [STATUS_IN_PROGRESS, ticketId, STATUS_OPEN]);
    if (result.rows.length === 0) {
        throw new Error('Ticket no encontrado o no está escalado a nivel 2.');
    }
    return result.rows[0];
};

//Cierra el ticket. Solo si está en progreso o abierto. Cambia status a 'resolved'.
export const cerrarTicket = async (ticketId) => {
    const query = `
        UPDATE tickets
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE ticket_id = $2 AND deleted_at IS NULL
        RETURNING *;
    `;
    const result = await pool.query(query, [STATUS_RESOLVED, ticketId]);
    if (result.rows.length === 0) throw new Error('Ticket no encontrado.');
    return result.rows[0];
};

export const obtenerTodos = async () => {
    const result = await pool.query('SELECT * FROM tickets WHERE deleted_at IS NULL ORDER BY created_at DESC');
    return result.rows;
};

export const obtenerPorId = async (ticketId) => {
    const result = await pool.query('SELECT * FROM tickets WHERE ticket_id = $1 AND deleted_at IS NULL', [ticketId]);
    if (result.rows.length === 0) throw new Error('Ticket no encontrado.');
    return result.rows[0];
};

export const obtenerPDF = async (ticketId) => {
    const ticket = await obtenerPorId(ticketId);
    return await crearResumenPdf(ticket);
};