const { Schema, model, default: mongoose } = require('mongoose');

const IdtSubdocumentSchema = Schema({
    id: {
        type: String,
        required: [true, 'El id del Tramite es obligatorio'],
        ref: 'Tramite'
    }
}, { _id: false }); // Esto evita que se genere un _id para el subdocumento

const ProyectoSchema = Schema({
    idt: [IdtSubdocumentSchema], // Usa el esquema del subdocumento aquí
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        ref: 'Tramite'
    },
    estado: {
        type: String,
        required: [true, "El estado es obligatoria"],
        default: 'Pendiente',
        emun: ['Pendiente','Iniciado','Concluido']
    },
    requisitos: [{
        requisito: {
            type: String,
            ref: 'Tramite'
        },
        estado:{
            type: Boolean,
            default: false,
        },
        archivoRequisito:[
            {
                url:{
                    type: String,
                    trim: true,
                    default: null
                },
                key:{
                    type: String,
                    trim: true,
                    default: null
                }
            }
        ],
        requisitoNotas: [
            {
                contenido: {
                    type: String,
                    trim: true,
                    default: null
                }
            },
        ]
    }],
    fechaIngresoTramite:{
        type: String,
    },
    fechaPrevencion:{
        type: String,
        ref: 'Tramite'
    },
    fechaRespuestaPrevencion:{
        type: String,
        ref: 'Tramite'
    },
    fechaRespuesta:{
        type: String,
        ref: 'Tramite'
    },
    notas:{
        type: String,
        maxlength: [500, 'El número máximo de caracteres para notas es 500']
    },
    usuario: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'El Usuario es requerido para la creación del proyecto'],
        ref: 'Usuario'
    }
});


module.exports = model('Proyecto', ProyectoSchema);