import * as ticketService from '../../Soporte.Application/ticketService.js';

// GET /api/tickets — L1 y L2
export const getTickets = async (req, res) => {
    try {
        const tickets = await ticketService.obtenerTodos();
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/tickets/:id — L1 y L2
export const getTicketById = async (req, res) => {
    try {
        const ticket = await ticketService.obtenerPorId(req.params.id);
        res.status(200).json(ticket);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// POST /api/tickets — solo L1
export const createTicket = async (req, res) => {
    try {
        const usuarioId = req.user.user_id;
        const nuevoTicket = await ticketService.crearTicket(req.body, usuarioId);
        res.status(201).json(nuevoTicket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT /api/tickets/:id — solo L1
export const updateTicket = async (req, res) => {
    try {
        const ticketActualizado = await ticketService.actualizarTicket(req.params.id, req.body);
        res.status(200).json(ticketActualizado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT /api/tickets/:id/escalate — solo L1
export const escalateTicket = async (req, res) => {
    try {
        const { comentario_tecnico } = req.body;
        const ticketEscalado = await ticketService.escalar(
            req.params.id,
            comentario_tecnico,
            req.user.user_id
        );
        res.status(200).json({
            message: 'Ticket escalado exitosamente a L2.',
            ticket: ticketEscalado
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT /api/tickets/:id/progreso — solo L2
export const inProgressTicket = async (req, res) => {
    try {
        const ticket = await ticketService.ponerEnProgreso(req.params.id);
        res.status(200).json({
            message: 'Ticket marcado como En Progreso.',
            ticket
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT /api/tickets/:id/cerrar — L1 y L2
export const closeTicket = async (req, res) => {
    try {
        const ticket = await ticketService.cerrarTicket(req.params.id);
        res.status(200).json({
            message: 'Ticket cerrado exitosamente.',
            ticket
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET /api/tickets/:id/pdf — L1 y L2
export const generarPDFTicket = async (req, res) => {
    try {
        const pdfBuffer = await ticketService.obtenerPDF(req.params.id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ticket_${req.params.id}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};