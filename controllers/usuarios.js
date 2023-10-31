//Esta linea me ayuda a conectar el controlador con las rutas ya que sino no podria 
//realizar el res de manera por default por lo que se iguala
const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const Usuario = require('../models/usuario');
const ResponseError = require('../utils/ResponseError')

//Aqui lo que se maneja es la url en parametros
const usuariosGet = async (req = request, res = response) => {
  
    const { limit = 4, page = 1 } = req.query;
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;
    const query = { estado: true };

  try {
    const [total, usuarios] = await Promise.all([
      Usuario.countDocuments(query),
      Usuario.find(query)
        .skip(skip)
        .limit(parsedLimit)
    ]);

    res.status(200).json({
      status: 'successful',
      total,
      data: usuarios,
      message: 'Usuarios Registrados'
    });
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'No se pudieron mostrar los usuarios',
      ex.message,
      []).responseApiError();
    
    res.status(500).json(
      response
    )
  }
};

const usuariosPut = async (req, res = response) => {

    const { id } = req.params;
    const { _id, password, google, correo, ...resto } = req.body;

    // TODO: Validar contra base de datos

    if (password) {
      const salt = bcryptjs.genSaltSync();
      resto.password = bcryptjs.hashSync(password, salt);
    }

    try {
    const usuario = await Usuario.findByIdAndUpdate(id, resto);
    res.status(200).json({ 
      status: 'successful',
      data: usuario,
    message: 'Usuario Encontrado'});
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'No se pudo actualizar el usuario',
      ex.message,
      []).responseApiError();

    res.status(500).json(
      response
    )
  }
};

const usuariosDelete = async (req, res = response) => {
    // Destructuramos de donde viene el id
    const { id } = req.params;
    try {
    // Fisicamente lo borramos
    // const usuario = await Usuario.findOneAndDelete( id );
    // Esta nos ayuda ya que se elimina desde mi backend pero queda en mi base de datos
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });

    res.status(200).json({
      status: 'successful',
      data: usuario,
      message: 'Usuario Eliminado Correctamente'
    });
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al eliminar el usuario',
      ex.response,
      []).responseApiError();

    req.status(500).json(
      response
    )
  }
};

const usuariosDeleteP = async (req, res = response ) =>{
  const { id } = req.params;
  try {
    // Buscar y eliminar el usuario por ID
    const usuarioEliminado = await Usuario.deleteOne({ _id: id });

    if (usuarioEliminado.deletedCount === 0) {
      const response = new ResponseError(
        'fial',
        'Usuario no encontrado',
        'El usuario no se encuentra al realizar la busqueda',
        []).responseApiError();

      return res.status(404).json(
        response
      )
    }
    res.status(200).json({
      status: 'successful',
      message: 'Usuario eliminado correctamente',
    });
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al eliminar el usuario',
      ex.message,
      []).responseApiError();

    return res.status(500).json(
      response
    )
  }
  
};



  module.exports = {
    usuariosGet,
    usuariosPut,
    usuariosDelete,
    usuariosDeleteP,
    
  }