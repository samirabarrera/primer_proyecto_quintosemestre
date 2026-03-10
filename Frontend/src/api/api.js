// Ruta relativa: el proxy de Vite redirige /api → http://localhost:3000/api
const BASE_URL = '/api';

/**
 * Devuelve los headers base para cada request.
 * Si el usuario está logueado, incluye el User-ID.
 */
const getHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const headers = { 'Content-Type': 'application/json' };
    if (user?.user_id) {
        headers['User-ID'] = user.user_id;
    }
    return headers;
};

/**
 * Helper genérico para fetch. Lanza error con el mensaje del backend.
 */
const request = async (method, path, body = null) => {
    const options = { method, headers: getHeaders() };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`);
    }
    return data;
};

// ================================================================
// CUSTOMERS
// ================================================================

export const getCustomers = () =>
    request('GET', '/customers');

export const getProducts = () =>
    request('GET', '/products');

// ================================================================
// USUARIOS
// ================================================================

export const registrarUsuario = (body) =>
    request('POST', '/users/registro', body);

export const loginUsuario = (body) =>
    request('POST', '/users/login', body);

// ================================================================
// TICKETS
// ================================================================

export const getTickets = () =>
    request('GET', '/tickets');

export const getTicketById = (id) =>
    request('GET', `/tickets/${id}`);

export const crearTicket = (body) =>
    request('POST', '/tickets', body);

export const actualizarTicket = (id, body) =>
    request('PUT', `/tickets/${id}`, body);

export const escalarTicket = (id, comentario_tecnico) =>
    request('PUT', `/tickets/${id}/escalate`, { comentario_tecnico });

export const ponerEnProgreso = (id) =>
    request('PUT', `/tickets/${id}/progreso`);

export const cerrarTicket = (id) =>
    request('PUT', `/tickets/${id}/cerrar`);

/**
 * Descarga el PDF del ticket directamente en el navegador.
 */
export const descargarPDF = async (id) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const headers = { 'User-ID': user?.user_id || '' };

    const res = await fetch(`${BASE_URL}/tickets/${id}/pdf`, { headers });
    if (!res.ok) throw new Error('No se pudo generar el PDF.');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
};
