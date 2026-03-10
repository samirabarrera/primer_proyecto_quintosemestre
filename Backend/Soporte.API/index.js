import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import usuarioRoutes from './routes/usuarioRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import pool from '../Soporte.Infraestructure/basededatos.js';

// Para que dotenv encuentre el .env en la carpeta raíz del Backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();

// Middlewares globales
app.use(express.json());
app.use(cors());

// Verificar conexión a la base de datos al iniciar
pool.query('SELECT NOW()')
    .then(res => console.log('Conexión a la DB exitosa:', res.rows[0].now))
    .catch(err => console.error('Error al conectar a la DB:', err.message));

// Rutas
app.use('/api/users', usuarioRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en el puerto: http://localhost:${PORT}`);
});