const { Router } = require("express")
const { cargarArchivoRequisito,
        crearProyecto,
        mostrarProyectos,
        actualizarProyectos,
        borrarProyectos,
        misProyectos,
        actualizarProyecto,
        borrarProyecto,
        archivo,
        borrarArchivoRequisito } = require('../controllers/proyectoController')

const { protect } = require('../middlewares/auth-validar');
const { esAdminRole, tieneRole } = require('../middlewares/validar-roles');

const router = Router();


//RUTAS PARA TODOS
router.post('/',[
    protect,
    // tieneRole('ADMIN_ROLE', 'USER_ROLE'),
], crearProyecto )

router.post('/cargarArchivoRequisito',[
    // protect,
    // tieneRole('ADMIN_ROLE', 'USER_ROLE')
],archivo,cargarArchivoRequisito)

router.delete('/borrarArchivoRequisito/:idProyecto/:idRequisito',[
    // protect,
    // tieneRole('ADMIN_ROLE', 'USER_ROLE')
], borrarArchivoRequisito)



//USER
router.get('/misProyectos',[
    protect,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
], misProyectos)

router.put('/actualizarProyecto/:id',[
    protect,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
], actualizarProyecto )

router.delete('/borrarProyecto/:id',[
    protect,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
],borrarProyecto)

//ADMIN
router.get('',[
    protect,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
    esAdminRole,
] ,mostrarProyectos )

router.put('/:id',[
    //protect,
    //tieneRole('ADMIN_ROLE', 'USER_ROLE'),
    //esAdminRole,
], actualizarProyectos )

router.delete('/:id',[
    //protect,
    //tieneRole('ADMIN_ROLE', 'USER_ROLE'),
    //esAdminRole
], borrarProyectos )



module.exports =  router;