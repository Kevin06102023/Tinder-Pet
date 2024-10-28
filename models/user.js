// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    contraseña: { type: String, required: true, minlength: 6 },
    fotoPerfil: { type: String },
    fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
