import express from 'express';
import { autenticar, verificarRol } from '../middleware/authMiddleware.js';
import {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    escalateTicket,
    generarPDFTicket,
    inProgressTicket,
    closeTicket
} from '../controllers/ticketController.js';

const router = express.Router();

// --- Rutas de consulta: level1 y level2 pueden ver ---
router.get('/', autenticar, verificarRol(['level1', 'level2']), getTickets);
router.get('/:id', autenticar, verificarRol(['level1', 'level2']), getTicketById);
router.get('/:id/pdf', autenticar, verificarRol(['level1', 'level2']), generarPDFTicket);

// --- Acciones de level1 ---
router.post('/', autenticar, verificarRol(['level1']), createTicket);
router.put('/:id', autenticar, verificarRol(['level1']), updateTicket);
router.put('/:id/escalate', autenticar, verificarRol(['level1']), escalateTicket);

// --- Acciones de level2 ---
router.put('/:id/progreso', autenticar, verificarRol(['level2']), inProgressTicket);

// --- Compartidas: level1 y level2 pueden cerrar ---
router.put('/:id/cerrar', autenticar, verificarRol(['level1', 'level2']), closeTicket);

export default router;