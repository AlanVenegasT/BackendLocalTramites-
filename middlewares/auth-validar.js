const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const  Usuario  = require('../models/usuario');
const ResponseError = require('../utils/ResponseError')

const protect = async ( req, res, next) =>{

    let token;
    //1)Traer el token y verificar si existe
    //startsWith significa si comienza con Bearer
    // console.log("OK")
    // console.log(req.cookies)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      
    
    } else if (req.cookies.jwt) {
      // console.log(token)
      token = req.cookies.jwt;
      // console.log(req.cookie)
    }



    if (!token) {
      const response = new ResponseError(
        'fail',
        'Tu no has iniciado sesión, por favor inicia sesión para obtener el acceso',
        'El  token no se obtiene de las cookies ni de los headers',
        []).responseApiError();
      return res.status(401).json(
        response
      )
    }
    console.log(token)

    try {
      //2) Verificar si el token es válido
      const decoded = await promisify(jwt.verify)(token, process.env.SECRETORPRIVATEKEY);
    
      //3) Verificar si el usuario existe
      const usuario = await Usuario.findById(decoded.uid)
      console.log(usuario)
      if (!usuario) {
        const response = new ResponseError(
          'fail',
          'El usuario que pertenece a este token ya no existe',
          'El token ya no exite , ya que el token esta vencido',
          []).responseApiError();
        return res.status(404).json(
          response
        )
      }
      //ACCESO A LA RUTA
      req.usuario = usuario;
      
      
      next();
    } catch (ex) {
      const response = new ResponseError(
        'fail',
        'Token inválido',
        ex.message,
        []).responseApiError();
      return res.status(401).json(
        response
      )
    }

}


module.exports = {
    protect
}