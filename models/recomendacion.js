const { Schema, model } = require('mongoose');

const RecomendacionSchema = Schema({
  categoria: {
    type: String,
    required: [true, 'El campo categoría es requerido'],
    trim: true
  },
  recomendaciones: [
    {
      nombre: {
        type: String,
        required: [true, 'El campo nombre de recomendación es requerido'],
        trim: true
      },
      url: {
        type: String,
        required: [true, 'El campo URL de recomendación es requerido'],
        trim: true
      }
    }
  ]
});

module.exports = model('Recomendacion', RecomendacionSchema);
