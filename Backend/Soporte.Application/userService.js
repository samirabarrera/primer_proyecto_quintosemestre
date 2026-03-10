import crypto from 'crypto';
import * as usuarioRepository from '../Soporte.Infraestructure/userRepository.js';

// La pimienta se carga desde .env (nunca hardcodeada en producción real)
const PIMIENTA = process.env.PEPPER_SECRET || 'MiPimientaSecreta2024!';

//Registra un nuevo usuario con hash de contraseña usando SAL + PIMIENTA.
export const registrar = async (fullName, email, password, role) => {
    // Validar rol según el ENUM del proyecto
    if (role !== 'level1' && role !== 'level2') {
        throw new Error('El rol debe ser "level1" o "level2".');
    }

    // Verificar que el email no esté registrado ya
    const existente = await usuarioRepository.obtenerPorEmail(email);
    if (existente) {
        throw new Error('Ya existe un usuario registrado con ese email.');
    }

    // 1. UUID único para el user_id
    const userId = crypto.randomUUID();

    // 2. Generar la SAL (valor aleatorio único para este usuario)
    const salt = crypto.randomBytes(16).toString('hex');

    // 3. Aplicar PIMIENTA a la contraseña
    const passwordConPimienta = password + PIMIENTA;

    // 4. Generar el HASH: pbkdf2(password+pimienta, sal, iteraciones, tamaño, algoritmo)
    const hash = crypto.pbkdf2Sync(passwordConPimienta, salt, 10000, 64, 'sha512').toString('hex');

    // 5. Guardar en la base de datos
    const usuarioGuardado = await usuarioRepository.crearUsuario({
        userId,
        fullName,
        email,
        passwordHash: hash,
        passwordSalt: salt,
        role
    });

    return usuarioGuardado;
};

/**
 * Autentica un usuario verificando sal + pimienta.
 * Devuelve los datos del usuario SIN información sensible.
 */
export const login = async (email, password) => {
    //Busca al usuario por email
    const usuario = await usuarioRepository.obtenerPorEmail(email);
    if (!usuario) {
        throw new Error('Credenciales inválidas.'); // Mensaje genérico por seguridad
    }

    //Aplica la misma PIMIENTA
    const passwordConPimienta = password + PIMIENTA;

    //Recalcular el hash usando la SAL guardada en DB
    const intentoHash = crypto.pbkdf2Sync(
        passwordConPimienta,
        usuario.password_salt,
        10000, 64, 'sha512'
    ).toString('hex');

    //Comparar hashes de forma segura
    if (intentoHash !== usuario.password_hash) {
        throw new Error('Credenciales inválidas.'); // Mismo mensaje genérico
    }

    //Retornar datos SIN el hash ni la sal
    const { password_hash, password_salt, ...usuarioSeguro } = usuario;
    return usuarioSeguro;
};