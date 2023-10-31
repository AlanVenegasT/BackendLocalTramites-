const { Router } = require("express")
const {check} = require('express-validator');
const { actualizarTramite,
        buscarTramite,
        crearTramite,
        mostrarTramite,
        borrarTramite,
        borrarAllTramite,
        cargarTramite, excel,
        mostrarTramitesTodo } = require('../controllers/tramiteController')
const { protect } = require ('../middlewares/auth-validar')
const { esAdminRole, tieneRole } = require('../middlewares/validar-roles');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();




router.get('/buscarT',[
    protect,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'), //Verifica que sea alguno de estos roles
    validarCampos
],buscarTramite);

router.get('/',[
    protect,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'), //Verifica que sea alguno de estos roles
    validarCampos
], mostrarTramite)


router.get('/mostrarTramitesTodo',[
    protect,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
] , mostrarTramitesTodo)

//Protegidas ADMIN

router.put('/:id',[
    protect,
    esAdminRole,       //Valida que el req.usuario sea admin para darle acceso
    tieneRole('ADMIN_ROLE', 'USER_ROLE'), //Verifica que sea alguno de estos roles
    validarCampos
],actualizarTramite);

router.delete('/:id',[
    protect,
    esAdminRole,       //Valida que el req.usuario sea admin para darle acceso
    tieneRole('ADMIN_ROLE', 'USER_ROLE'), //Verifica que sea alguno de estos roles
    validarCampos
],borrarTramite);

router.delete('/borrar/all',[
    protect,
    esAdminRole,       //Valida que el req.usuario sea admin para darle acceso
    tieneRole('ADMIN_ROLE', 'USER_ROLE'), //Verifica que sea alguno de estos roles
    validarCampos
],borrarAllTramite);

router.post('/cargarArchivo',[
    protect,
    esAdminRole,       //Valida que el req.usuario sea admin para darle acceso
    tieneRole('ADMIN_ROLE', 'USER_ROLE'), //Verifica que sea alguno de estos roles
    validarCampos
],excel,cargarTramite);

router.post('/',[
    protect,
    esAdminRole,       //Valida que el req.usuario sea admin para darle acceso
    tieneRole('ADMIN_ROLE', 'USER_ROLE'), //Verifica que sea alguno de estos roles
    validarCampos
],crearTramite);


module.exports =  router;