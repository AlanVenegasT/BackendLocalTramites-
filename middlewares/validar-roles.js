const { response } = require("express")
const ResponseError = require('../utils/ResponseError')

const esAdminRole = ( req, res = response, next) => {

    if ( !req.usuario ) {
        const response = new ResponseError(
            'fail',
            'Se quiere verificar el role sin validar el token primero',
            'No se esta encontrando el usuario para poder validar el rol',
            []).responseApiError();
        return res.status(500).json(
            response
        );
    }

    const { rol, nombre } = req.usuario;
    console.log(req.usuario)
    if ( rol !== 'ADMIN_ROLE') {
        const response = new ResponseError(
            'fail',
            `${ nombre } no es administrador - No se puede hacer esto`,
            'No cuentas con el Rol de Administrador',
            []).responseApiError();

        return res.status(401).json(
            response
        );
    }

    next();
}

const tieneRole = ( ...roles ) => {
    return ( req, res = response, next ) =>{
        
        if ( !req.usuario ) {
            const response = new ResponseError(
                'fail',
                'Se quiere verificar el role sin validar el token primero',
                'No se encuentra el usuario, para validar tu rol',
                []).responseApiError();
            return res.status(500).json(
                response
            );
        }

        if ( !roles.includes( req.usuario.rol ) ) {
            const response = new ResponseError(
                'fail',
                `El servicio requiere uno de estos roles ${ roles }`,
                'Para poder ingresar debes de contar con un rol requerido, cuentas con otro.',
                []).responseApiError();
            return res.status(401).json(
                response
            );
        }

        next();
    }
}




module.exports ={
    esAdminRole,
    tieneRole
}