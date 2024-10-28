// models/pet.js
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    raza: { type: String, required: true },
    edad: { type: Number, required: true },
    biografia: { type: String }, // Campo opcional
    idPropietario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foto: { type: String } // Campo opcional para almacenar la ruta o URL de la foto
});

// Exporta el modelo
module.exports = mongoose.model('Pet', petSchema);
