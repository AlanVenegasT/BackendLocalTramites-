const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const ResponseError = require('../utils/ResponseError')



const validarJWT = async ( req = request, res = response, next) =>{
    
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        
      
      } else if (req.cookies.jwt) {
        // console.log(token)
        token = req.cookies.jwt;
        // console.log(req.cookie)
      }

    if ( !token ) {
        const response = new ResponseError(
            'fail',
            'No hay token en la petición',
            'No se encuentra el token en la peticion ',
            []).responseApiError();
        return res.status(401).json(
            response
        );
    }
    
    try {

        const { uid } = jwt.verify( token, process.env.SECRETORPRIVATEKEY );
        //leer el usuario que corresponde al uid
        const usuario = await Usuario.findById( uid );

        if ( !usuario ) {
            const response = new ResponseError(
                'fail',
                'Token no válido - usuario no existe DB',
                'No se encontro el token en la peticion, no se puede procesar',
                []).responseApiError();
            return res.status(401).json(
                response
            )
        }

        //verificar si el uid tiene estado true
        if (!usuario.estado) {
        const response = new ResponseError(
            'fail',
            'Token no válido - usuario con estado: false',
            'El estado del usuario esta en en false, porfavor confirma la cuenta',
            []).responseApiError();
        return res.status(401).json(
            response
        )
        }
       
        req.usuario = usuario;
        next();
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'Token no válido',
            ex.message,
            []).responseApiError();

        res.status(401).json(
            response
        )
    }

}

module.exports = {
    validarJWT
}