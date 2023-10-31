//Aqui se extrae un funcion de express
const { Router } = require('express');
const {check} = require('express-validator');
const { cerrarSesion,
        confirmar,
        comprobarToken,
        login, 
        googleSignIn,  
        olvidePassword, 
        nuevoPassword,
        registrar
        } = require('../controllers/authController');
const { actualPassword,
        actualizarUsuario,
        deleteMe, 
        getMe, 
        oneUser} = require('../controllers/usuarioController')

const { validarCampos } = require('../middlewares/validar-campos');
// const bcryptjs = require('bcryptjs');
// const { emailExiste } = require('../helpers/db-validators');
const { protect } = require ('../middlewares/auth-validar');
const {  tieneRole } = require('../middlewares/validar-roles');


const router = Router();

//Es enviar
//Aqui se validan los campos que vamos a recibir
router.post('/login',login );

router.get('/cerrarSesion', cerrarSesion)

router.get('/confirmar/:token', confirmar)

router.post('/registrar',registrar)

router.post('/olvide-password',olvidePassword ); 

router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword);

router.post('/google',[
    check('id_token', 'id_token es necesario').not().isEmpty(),
    validarCampos
], googleSignIn );


//RUTAS DEL USUARIO//
//la ruta /me está protegida por el middleware protect, que verifica la autenticación del usuario a través del token y 
//configura req.usuario con la información del usuario. Luego, el middleware getMe verifica que req.usuario esté configurado 
//y extrae el id del usuario para que esté disponible en la consulta de la base de datos realizada por el middleware oneUser. 
//Finalmente, oneUser busca el documento del usuario por el id y devuelve una respuesta JSON con el resultado.
router.post('/actual-password',[
    protect,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
], actualPassword)

router.put('/',[
    protect,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
], actualizarUsuario)

router.route('/me').get(protect, getMe, oneUser);
router.route('/deleteMe').delete(protect,deleteMe);


// router.route('/updateMe').patch(uploadUserPhoto,tamañoPhotoUser,updateMe);


module.exports = router;