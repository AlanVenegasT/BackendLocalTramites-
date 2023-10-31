const Role = require('../models/role');
const Usuario  = require('../models/usuario');


const esRoleValido = async(rol = '') => {
    const existeRol = await Role.findOne({ rol });
    //Es un error personalizado que quedara atrabado en el custom
    if ( !existeRol ) {
            throw new Error(`El rol ${ rol } no esta registrado en la base de BD`)
    }
}

const emailExiste = async ( correo = '') =>{
    //VERIFICAR SI EL CORREO EXISTE
    const existeEmail = await Usuario.findOne({correo });
    if (existeEmail) {
        throw new Error(`El correo: ${ correo } ya está registrado`);
    }
}

const existeUsuarioPorId = async ( id ) =>{
    //VERIFICAR SI EL CORREO EXISTE
    const existeUsuario = await Usuario.findById(id);
    if (!existeUsuario) {
        throw new Error(`El id no existe ${ id }`);
    }
}

module.exports = {
    esRoleValido,
    emailExiste,
    existeUsuarioPorId

}