const { Schema } = require('mongoose');

const AccesoChat= new Schema({
    acceso: {
        type: Boolean,
        default: false
    },
    fechaInicio: {
        type: Date,
        default: Date.now
    },
    intentos: {
        type: Number,
        default: 10
    }
});

module.exports = AccesoChat;
