// Importación de módulos
const express = require('express');
const multer = require('multer'); // Para manejar la subida de archivos
const mongoose = require('mongoose'); // Para conectar a MongoDB
const User = require('./models/user'); // Importa el modelo de User
const Pet = require('./models/pet'); // Importa el modelo de Pet
const bcrypt = require('bcrypt'); // Para encriptar contraseñas
const jwt = require('jsonwebtoken'); // Para manejar JWT
const cors = require('cors'); // Para manejar CORS
const path = require('path'); // Para manejar rutas de archivos
const { body, validationResult } = require('express-validator'); // Para la validación de datos
require('dotenv').config(); // Cargar variables de entorno desde .env

const app = express();
const upload = multer({ dest: 'uploads/' }); // Configura el destino de las imágenes

// Middleware
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Para parsear JSON en el cuerpo de las solicitudes
app.use(express.urlencoded({ extended: true })); // Para parsear datos de formularios
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extrae el token de la cabecera
    if (!token) return res.sendStatus(401); // Sin token, no se permite el acceso

    jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto', (err, user) => {
        if (err) {
            console.error("Error de verificación del token:", err); // Log de error
            return res.sendStatus(403); // Token no válido
        }
        req.user = user; // Guarda el usuario en la solicitud
        next(); // Continúa a la siguiente función middleware
    });
};

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tinderpet', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Conectado a MongoDB"))
.catch(err => {
    console.error("Error de conexión a MongoDB:", err);
    process.exit(1); // Termina el proceso si la conexión falla
});

// Ruta para registrar un nuevo propietario
app.post('/api/auth/register-owner', 
    body('nombre').notEmpty().withMessage('El nombre es obligatorio.'),
    body('correo').isEmail().withMessage('El correo no es válido.'),
    body('contraseña').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, correo, contraseña } = req.body;

    try {
        const existingUser = await User.findOne({ correo });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está registrado." });
        }

        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const nuevoPropietario = new User({
            nombre,
            correo,
            contraseña: hashedPassword, // Guardar la contraseña encriptada
        });

        await nuevoPropietario.save();
        res.status(201).json({ message: "Propietario registrado con éxito.", idPropietario: nuevoPropietario._id });
    } catch (error) {
        console.error("Error al registrar el propietario:", error);
        res.status(500).json({ message: "Error al registrar el propietario.", error: error.message });
    }
});

// Ruta para iniciar sesión
app.post('/api/auth/login', 
    body('correo').isEmail().withMessage('El correo no es válido.'),
    body('contraseña').notEmpty().withMessage('La contraseña es obligatoria.'),
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { correo, contraseña } = req.body;

    try {
        const usuario = await User.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!isMatch) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET || 'tu_secreto', { expiresIn: '1h' });
        res.json({ message: "Inicio de sesión exitoso.", token });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ message: "Error al iniciar sesión.", error: error.message });
    }
});

// Ruta para mostrar el contenido después del inicio de sesión
app.get('/principal/tinder', authenticateToken, (req, res) => { 
    res.sendFile(path.join(__dirname, 'principal', 'tinder.html')); 
});

// Ruta para crear un nuevo registro de mascota (requiere el ID del propietario)
app.post('/api/auth/register-pet', 
    upload.single('foto'), 
    async (req, res) => {
    const { nombre, raza, edad, biografia, idPropietario } = req.body;

    if (!nombre || !raza || !edad || !biografia || !idPropietario) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    try {
        const propietario = await User.findById(idPropietario);
        if (!propietario) {
            return res.status(404).json({ message: "Propietario no encontrado." });
        }

        const nuevaMascota = new Pet({
            nombre,
            raza,
            edad: parseInt(edad, 10),
            biografia,
            idPropietario,
            foto: req.file ? req.file.path : null, // Solo si hay foto
        });

        await nuevaMascota.save();
        res.status(201).json({ message: "Mascota registrada con éxito." });
    } catch (error) {
        console.error("Error al registrar la mascota:", error);
        res.status(500).json({ message: "Error al registrar la mascota.", error: error.message });
    }
});

// Ruta para obtener todos los perros
app.get('/api/perros', authenticateToken, async (req, res) => {
    try {
        const perros = await Pet.find(); // Obtiene todos los perros de la base de datos
        res.json(perros); // Envía la lista de perros como respuesta
    } catch (error) {
        console.error("Error al obtener los perros:", error);
        res.status(500).json({ message: "Error al obtener los perros.", error: error.message });
    }
});

// Ruta para obtener las mascotas de un propietario específico
app.get('/api/pets/:idPropietario', authenticateToken, async (req, res) => {
    const { idPropietario } = req.params;

    try {
        const mascotas = await Pet.find({ idPropietario });
        res.json(mascotas);
    } catch (error) {
        console.error("Error al obtener las mascotas:", error);
        res.status(500).json({ message: "Error al obtener las mascotas.", error: error.message });
    }
});

// Ruta para eliminar una mascota
app.delete('/api/pets/:idMascota', authenticateToken, async (req, res) => {
    const { idMascota } = req.params;

    try {
        const resultado = await Pet.findByIdAndDelete(idMascota);
        if (!resultado) {
            return res.status(404).json({ message: "Mascota no encontrada." });
        }
        res.json({ message: "Mascota eliminada con éxito." });
    } catch (error) {
        console.error("Error al eliminar la mascota:", error);
        res.status(500).json({ message: "Error al eliminar la mascota.", error: error.message });
    }
});

// Puerto y servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
