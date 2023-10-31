const {getOne} = require('./handleFactory')
const Usuario = require('../models/usuario');
const bcryptjs = require('bcryptjs');
const ResponseError = require('../utils/ResponseError')
const mongoose = require('mongoose');
const { response, request } = require('express');
///Control del Usuario/////

const actualPassword = async (req, res)  =>{

    const { password } = req.body;
    const usuario = req.usuario;

    if (!password) {
        const response = new ResponseError(
            'fail',
            'La contraseña es obligatoria',
            'Ingresa la contraseña porfavor no estas ingresando nada',
            []).responseApiError();

        return res.status(400).json(
            response
        );
    }

    // Validar si la contraseña tiene más de 6 caracteres
    if (password.length < 8) {
        const response = new ResponseError(
            'fail',
            'Contraseña demasiado corta',
            'La contraseña debe tener más de 6 caracteres',
            []
        ).responseApiError();

        return res.status(400).json(
            response
        );
    }

    if (usuario) {
        usuario.password = password;
    }

    try {
        const salt = bcryptjs.genSaltSync();
        usuario.password = bcryptjs.hashSync( password, salt);
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'Hubo un problema en el hash',
            ex.message,          
            []).responseApiError();
        res.status(500).json(
            response
        )
    }

    try {
        await usuario.save();
        res.status(200).json({
            status: 'successful',
            message: 'Password Modificado Correctamente'
        })
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'El Password no se pudo Modificar',
            ex.message,
            []).responseApiError();

        return res.status(500).json(
            response
        )
    }
};

const actualizarUsuario = async (req, res) => {
    const { nombre, correo } = req.body;
    const usuario = req.usuario;


    if (!usuario) {
        const response = new ResponseError(
            'fail',
            'Usuario no encontrado',
            'El Usuario no se encontro en la peticion protect',
            []).responseApiError();
        
        return res.status(404).json(
            response
        )
    }

    if (nombre) {
        usuario.nombre = nombre;
    }
    if (correo) {
        usuario.correo = correo;
    }
    try {
        await usuario.save();
        res.status(200).json({
            status: 'successful',
            data: usuario,
            message: "Usuario Actualizado Correctamente"
        });
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'No se puede Actualizar',
            ex.message,
            []).responseApiError();
        res.status(500).json(
            response
        )
    }
}

const deleteMe = async(req,res,next)=>{
    await Usuario.findByIdAndUpdate(req.usuario.id,{activo: false});
    res.status(204).json({
        status: "successful",
        data: null,
        message: 'Borrado Correctamente',
    })
};

const getMe = (req,res,next)=>{
   // Verificar si req.usuario está definido
   req.params.id = req.usuario.id;

   if (!req.params.id) {
        const response = new ResponseError(
            'fail',
            'El usuario por id no existe getMe',
            'El usuario no se encontro por el id',
            []).responseApiError();
        return res.status(404).json(
            response
        )
   }
  next();
};

const oneUser = getOne(Usuario);

//Operaciones CRUD con los Usuarios.
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

    let existeUsuario = null;

    const { id } = req.params;
    const { _id, password, google, correo, ...resto } = req.body;

    // TODO: Validar contra base de datos
    try {
      existeUsuario = await Usuario.findById(id);
    } catch (ex) {
      const response = new ResponseError(
        'fail',
        `El id no existe ${ id }`,
        ex.message,
      []).responseApiError();

      res.status(404).json(
        response
      )
    }

    if (!mongoose.isValidObjectId(id)) {
      const response = new ResponseError(
        'fail',
        'ID inválido',
        'El ID proporcionado no es válido',
        []
      ).responseApiError();
  
      return res.status(400).json(response);
    }

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
    
    let existeUsuario = null;
  
    // Destructuramos de donde viene el id
    const { id } = req.params;
    

    try {
      existeUsuario = await Usuario.findById(id);
    } catch (ex) {
      const response = new ResponseError(
        'fail',
        `El id no existe ${ id }`,
        ex.message,
      []).responseApiError();

      res.status(404).json(
        response
      )
    }

    if (!mongoose.isValidObjectId(id)) {
      const response = new ResponseError(
        'fail',
        'ID inválido',
        'El ID proporcionado no es válido',
        []
      ).responseApiError();
  
      return res.status(400).json(response);
    }

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

    res.status(500).json(
      response
    )
  }
};

const usuariosDeleteP = async (req, res = response ) =>{

  let existeUsuario = null;

  const { id } = req.params;

  try {
    existeUsuario = await Usuario.findById(id);
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      `El id no existe ${ id }`,
      ex.message,
    []).responseApiError();

    res.status(404).json(
      response
    )
  }

  if (!mongoose.isValidObjectId(id)) {
    const response = new ResponseError(
      'fail',
      'ID inválido',
      'El ID proporcionado no es válido',
      []
    ).responseApiError();

    return res.status(400).json(response);
  }


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

module.exports ={
    actualPassword,
    actualizarUsuario,
    deleteMe,
    getMe,
    oneUser,
    usuariosGet,
    usuariosPut,
    usuariosDelete,
    usuariosDeleteP,
}