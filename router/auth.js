const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Pet = require('../models/pet');
const Usuario = require('../models/Usuario');
require('dotenv').config(); // Cargar variables de entorno

// Configuración de multer para subir imágenes
const upload = multer({ dest: 'uploads/' });

// Middleware para verificar el token
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No estás autorizado. Por favor, inicia sesión.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado' });
        }
        req.userId = decoded.id;
        next();
    });
};

// Ruta para manejar el registro de mascotas
router.post('/registerPet', verificarToken, upload.single('foto'), async (req, res) => {
    const { nombre, raza, edad, biografia, idPropietario } = req.body;

    // Validar que todos los campos necesarios están presentes
    if (!nombre || !raza || !edad || !biografia || !idPropietario) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Crear un nuevo registro de mascota
    const nuevoRegistro = {
        nombre,
        raza,
        edad: parseInt(edad, 10),
        biografia,
        idPropietario,
        foto: req.file ? req.file.path : null,
    };

    // Guardar el nuevo registro en la base de datos
    try {
        await Pet.create(nuevoRegistro);
        res.status(201).json({ message: 'Registro exitoso' });
    } catch (err) {
        console.error('Error al registrar la mascota:', err);
        res.status(500).json({ message: 'Error al registrar la mascota' });
    }
});

// Ruta para manejar el inicio de sesión
router.post('/login', async (req, res) => {
    const { correo, contraseña } = req.body;

    // Validar que se proporcionaron los campos requeridos
    if (!correo || !contraseña) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Crear un token JWT
        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Ruta para obtener todas las mascotas
router.get('/pets', verificarToken, async (req, res) => {
    try {
        const pets = await Pet.find();
        res.json(pets);
    } catch (error) {
        console.error('Error al obtener mascotas:', error);
        res.status(500).json({ message: 'Error al obtener mascotas' });
    }
});

// Exportar el router
module.exports = router;
