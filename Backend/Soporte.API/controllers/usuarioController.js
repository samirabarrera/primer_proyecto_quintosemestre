import * as userService from '../../Soporte.Application/userService.js';

/**
 * POST /api/users/registro
 * Registra un nuevo usuario con rol L1 o L2.
 */
export const registrarUsuario = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        if (!fullName || !email || !password || !role) {
            return res.status(400).json({
                message: 'Todos los campos son obligatorios: fullName, email, password, role.'
            });
        }

        const usuario = await userService.registrar(fullName, email, password, role);
        res.status(201).json({
            message: 'Usuario registrado exitosamente.',
            usuario
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * POST /api/users/login
 * Autentica al usuario. 
 */
export const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y password son obligatorios.' });
        }

        const usuario = await userService.login(email, password);
        res.status(200).json({
            message: 'Login exitoso.',
            usuario // { user_id, full_name, email, role } 
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};
