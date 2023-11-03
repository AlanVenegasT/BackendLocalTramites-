const { response } = require("express");
const bcryptjs = require('bcryptjs');
const Usuario = require('../models/usuario');
const { generarJWT } = require("../helpers/generar-jwt");
const { googleVerify } = require("../helpers/google-verify");
const generarId = require("../helpers/generarId");
const { emailOlvidePassword, emailRegistro } = require('../helpers/email')
const { emailRegistroP, emailOlvidePasswordP } = require('../helpers/emailSender')
const ResponseError = require('../utils/ResponseError')


const createSendToken = async (usuario, statusCode, req, res) => {
    // Generar el JWT
    let token = null;
    try {
        token = await generarJWT(usuario.id);
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'Hubo un error al crear el token',
            ex.message,
            []).responseApiError();

        res.status(500).json(
            response
        )
    }
    // Configurar las opciones de la cookie
    const cookieOptions = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        secure: true,
        // httpOnly: true, // La cookie no puede ser accedida desde JavaScript
        sameSite: 'none' // La cookie será accesible desde cualquier sitio
    };
    // Configura la cookie
    res.cookie('jwt', token, cookieOptions);
    
    

    res.status(statusCode).json({
        status: "successful",
        token,
        data: usuario,
        message: "Inicio de Sesión Correctamente",
        checkToken: true
    });
};


const login = async (req, res = response) => {
    const { correo, password } = req.body;

    if (!correo) {
        const response = new ResponseError(
            'fail',
            'El correo es obligatorio',
            'Ingresa el correo porfavor no estas ingresando nada',
            []).responseApiError();

        return res.status(400).json(
            response
        );
    }

    // Validar si el correo electrónico tiene la estructura correcta
    const correoRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!correoRegex.test(correo)) {
        const response = new ResponseError(
            'fail',
            'El correo no es válido',
            'Ingresa un correo válido en el formato correcto',
            []
        ).responseApiError();

        return res.status(400).json(
            response
        );
    }

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


    let usuario = null;
    let valiPassword = null;
    try {
        //Verificar si el email existe
        usuario = await Usuario.findOne({ correo });
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'Hubo un error al ingresar',
            ex.message,
            []).responseApiError();

        res.status(500).json(
            response
        )
    }
    if (!usuario) {
        const response = new ResponseError(
            'fail',
            'Email o Password incorrectos',
            'El correo o password son incorrectos porfavor ingresa un correo o password valido',
            []).responseApiError();

        return res.status(400).json(
            response
        );
    }
    //Si el usuario esta activo
    if (!usuario.estado) {
        const response = new ResponseError(
            'fail',
            'Tu cuenta no ha sido confirmada',
            'Debes de confirmar tu cuenta para poder ingresar',
            []).responseApiError();

        return res.status(400).json(
            response
        );
    }
    //Verificar la contraseña

    try {
        valiPassword = bcryptjs.compareSync(password, usuario.password);
    } catch (ex) {
        const response = new ResponseError(
            'faild',
            'El correo o password son incorrectos porfavor ingresa un correo o password valido',
            ex.message,
            []).responseApiError();

        res.status(500).json(
            response
        );
    }
    if (!valiPassword) {
        const response = new ResponseError(
            'fail',
            'Email o Password incorrectos',
            'El correo o password son incorrectos porfavor ingresa un correo o password valido',
            []).responseApiError();

        return res.status(400).json(
            response
        );
    }
    //Enviar un JWT al cliente
    createSendToken(usuario, 200, req, res);
}

const registrar = async (req, res) => {

    const { nombre, correo, password, rol } = req.body;
    const usuario = new Usuario({ nombre, correo, password, rol });

    if (!correo) {
        const response = new ResponseError(
            'fail',
            'El correo es obligatorio',
            'Ingresa el correo porfavor, no estas ingresando nada',
            []).responseApiError();

        return res.status(400).json(
            response
        );
    }

    // Validar si el correo electrónico tiene la estructura correcta
    const correoRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!correoRegex.test(correo)) {
        const response = new ResponseError(
            'fail',
            'El correo no es válido',
            'Ingresa un correo válido en el formato correcto',
            []
        ).responseApiError();

        return res.status(400).json(
            response
        );
    }

    try {
        const existingUser = await Usuario.findOne({ correo: correo });
        if (existingUser) {
            const response = new ResponseError(
                'fail',
                'El correo ya está registrado',
                'El correo electrónico proporcionado ya está registrado en la base de datos',
                []
            ).responseApiError();

            return res.status(400).json(response);
        }
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'Hubo un error al verificar el correo',
            ex.message,
            []
        ).responseApiError();

        res.status(500).json(response);
    }

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

    // Validar si la contraseña tiene al menos 6 caracteres
    if (password.length < 8) {
        const response = new ResponseError(
            'fail',
            'Contraseña demasiado corta',
            'La contraseña debe tener al menos 8 caracteres',
            []
        ).responseApiError();

        return res.status(400).json(
            response
        );
    }

    try {
        const salt = bcryptjs.genSaltSync();
        usuario.password = bcryptjs.hashSync(password, salt);
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'Hubo un error en el hash',
            ex.message,
            []).responseApiError();

        res.status(500).json(
            response
        );
    }

    try {
        usuario.token = generarId();
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'Hubo un error en el token id',
            ex.message,
            []).responseApiError();

        res.status(500).json(
            response
        )
    }

    try {
        await usuario.save();
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'Hubo un error al guardar el usuario en la base de datos',
            ex.message,
            []).responseApiError();

        res.status(500).json(
            response
        )
    }

    
    emailRegistroP({
        correo: usuario.correo,
        nombre: usuario.nombre,
        token: usuario.token,
        });
            

    res.status(200).json({
        status: 'successful',
        data: usuario,
        message: 'Usuario Creado Correctamente'
    });

}


const cerrarSesion = async (req, res) => {
    res.cookie('jwt', 'CerrarSesion', {
        expires: new Date(0), 
        secure: true,
        sameSite: 'none',
    });

    
    
    res.status(200).json({
        status: 'successful',
        message: 'Cerrando Sesion Correctamente'

    })
}

const confirmar = async (req, res = response) => {
    const { token } = req.params;

    try {
        const usuarioConfirmar = await Usuario.findOne({ token });

        if (!usuarioConfirmar) {
            const response = new ResponseError(
                'fail',
                'Token no valido',
                'No existe el usuario para confirmar tu cuenta',
                []
            ).responseApiError();

            return res.status(403).json(response); // Return here to prevent further execution
        }

        usuarioConfirmar.estado = true;
        usuarioConfirmar.token = "";
        await usuarioConfirmar.save();
        res.status(200).json({
            status: 'successful',
            message: "Usuario Confirmado Correctamente "
        });
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'No se pudo confirmar el Usuario',
            ex.message,
            []
        ).responseApiError();

        res.status(500).json(response);
    }
}

const olvidePassword = async (req, res = response) => {
    const { correo } = req.body;

    if (!correo) {
        const response = new ResponseError(
            'fail',
            'El correo es obligatorio',
            'Ingresa el correo porfavor no estas ingresando nada',
            []).responseApiError();

        return res.status(400).json(
            response
        );
    }


    let usuario = null;
    try {
        usuario = await Usuario.findOne({ correo });
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'No se encontro el usuario',
            ex.message,
            []).responseApiError();

        res.status(500).json(
            response
        )
    }

    if (!usuario) {
        const response = new ResponseError(
            'fail',
            'Usuario no encontrado',
            'El usuario no existe',
            []).responseApiError();

        return res.status(404).json(
            response
        )
    }

    try {
        usuario.token = generarId();
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'Error al generar el id',
            ex.message,
            []).responseApiError();

        res.status(500).json(
            response
        )
    }


    try {
        await usuario.save();
        //enviar email
        emailOlvidePasswordP({
            correo: usuario.correo,
            nombre: usuario.nombre,
            token: usuario.token,
        })

        res.status(200).json({
            status: 'successful',
            message: "Hemos enviado un email con las instrucciones"
        })
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'Hubo un error en el servidor al enviar el email',
            ex.message,
            []).responseApiError();

        res.status(500).json(
            response
        )
    }

}

const comprobarToken = async (req, res = response) => {
    const { token } = req.params;
    let tokenValido = null;

    try {
        tokenValido = await Usuario.findOne({ token });
    } catch (ex) {
        // Aquí se captura cualquier error que ocurra durante la ejecución del código dentro del bloque try
        const response = new ResponseError(
            'fail',
            'Error al comprobar el token',
            ex.message,
            []).responseApiError();

        res.status(500).json(
            response
        );
    }

    if (tokenValido) {
        res.status(200).json({
            status: 'successful',
            message: "Token válido y el Usuario existe"
        });
    } else {
        const response = new ResponseError(
            'fail',
            'Token invalido',
            'El token es invalido ,por lo que, no se realiza el proceso.',
            []).responseApiError();

        return res.status(404).json(
            response
        )
    }


};

const nuevoPassword = async (req, res = response) => {
    const { token } = req.params;
    const { password } = req.body;

    let usuario = null;

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

    // Validar si la contraseña tiene al menos 6 caracteres
    if (password.length < 8) {
        const response = new ResponseError(
            'fail',
            'Contraseña demasiado corta',
            'La contraseña debe tener al menos 8 caracteres',
            []
        ).responseApiError();

        return res.status(400).json(
            response
        );
    }
    
    try {
        usuario = await Usuario.findOne({ token });
    } catch (ex) {
        const response = new ResponseError(
            'fail',
            'El usuario no existe',
            ex.message,
            []).responseApiError();

        return res.status(404).json(
            response
        )
    }


    if (usuario) {
        usuario.password = password;

        try {
            const salt = bcryptjs.genSaltSync();
            usuario.password = bcryptjs.hashSync(password, salt);
        } catch (ex) {
            const response = new ResponseError(
                'fail',
                'Hubo un error en el hash',
                ex.message,
                []).responseApiError();

            return res.status(500).json(
                response
            );
        }



        usuario.token = "";
        try {
            await usuario.save();
            res.status(200).json({
                status: 'successful',
                message: "Password Modificado Correctamente"
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
    } else {

        const response = new ResponseError(
            'fail',
            'Token no válido',
            'El usuario no existe por lo que no se encontro el token',
            []).responseApiError();

        return res.status(404).json(
            response
        )
    }
}

const googleSignIn = async (req, res = response) => {
    const { id_token } = req.body;
    try {
        const { correo, nombre, img } = await googleVerify(id_token);
        let usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            //Tengo que crearlo
            const data = {
                nombre,
                correo,
                password: ':p',
                img,
                google: true
            };

            usuario = new Usuario(data);
            await usuario.save();
        }
        //Si el usuario en DB
        if (!usuario.estado) {
            return res.status(401).json({
                msg: 'Hable con el administrador, usuario bloqueado'
            });
        }
        //Generar JWT
        const token = await generarJWT(usuario.id);
        res.json({
            usuario,
            token
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            msg: 'El Token no se pudo verificar'
        })
    }
}


module.exports = {
    cerrarSesion,
    confirmar,
    comprobarToken,
    login,
    olvidePassword,
    nuevoPassword,
    googleSignIn,
    registrar,
}