// config/database.js
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/tinderpet')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('No se pudo conectar a MongoDB', err));

