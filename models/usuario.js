const { Schema, model } = require('mongoose');
const AccesoChat = require('./accesoChat');

const UsuarioSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        //Este atributo te ayuda para que no se repita el correo
        unique: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
    },
    img: {
        type: String,
        default: "https://iktan-training-production.s3.amazonaws.com/Usuarios/Foto+de+Perfil+Default/default.png"
    },
    rol: {
        type: String,
        required: [true, 'El rol es obligatorio'],
        default: 'USER_ROLE',
        emun: ['ADMIN_ROLE', 'USER_ROLE']
    },
    estado:{
        type: Boolean,
        default: false
    },
    google: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
    },
    accesoChat: {
        type: AccesoChat,
        default: {
            acceso: false,
            diasRestantes: 30,
            intentos: 10,
        }
    }
   
});

//En este metodo saco los atributos que quiero sacar como el password
UsuarioSchema.methods.toJSON = function(){
    const { __v, _id, password, ...usuario } = this.toObject();
    usuario.uid = _id;
    return usuario;
}

module.exports = model( 'Usuario', UsuarioSchema  )