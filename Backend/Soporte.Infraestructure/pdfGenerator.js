import PDFDocument from 'pdfkit';

/**
 * Genera un PDF con el resumen del ticket.
 * @param {Object} ticket - Fila de la DB (snake_case)
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
export const crearResumenPdf = (ticket) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // --- ENCABEZADO ---
            doc.fontSize(20).font('Helvetica-Bold')
               .text('Sistema de Soporte - Resumen del Ticket', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica')
               .text(`Generado: ${new Date().toLocaleString('es-MX')}`, { align: 'center' });

            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // --- DATOS DEL TICKET ---
            const linea = (label, valor) => {
                doc.fontSize(11).font('Helvetica-Bold').text(label, { continued: true });
                doc.font('Helvetica').text(` ${valor || 'N/A'}`);
            };

            linea('ID del Ticket:', ticket.ticket_id);
            linea('Asunto:', ticket.subject);
            linea('Tipo:', ticket.type);
            linea('Impacto:', ticket.impact);
            linea('Estado:', ticket.status);
            linea('Nivel Actual:', ticket.current_level === 1 ? 'L1 (Soporte Nivel 1)' : 'L2 (Soporte Nivel 2)');
            linea('Creado:', ticket.created_at ? new Date(ticket.created_at).toLocaleString('es-MX') : 'N/A');
            linea('Última actualización:', ticket.updated_at ? new Date(ticket.updated_at).toLocaleString('es-MX') : 'N/A');

            if (ticket.description) {
                doc.moveDown();
                doc.fontSize(11).font('Helvetica-Bold').text('Descripción:');
                doc.fontSize(11).font('Helvetica').text(ticket.description, { align: 'justify' });
            }

            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
            doc.fontSize(9).fillColor('gray')
               .text('Este documento es generado por el sistema Micro-Soporte L1/L2.', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};