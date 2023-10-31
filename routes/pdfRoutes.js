const { Router } = require("express")

const  { generarPdf,
        entrenamiendoNube,
        pdfS}  = require('../controllers/pdfController')

const { protect } = require ('../middlewares/auth-validar');  
const { tieneRole } = require('../middlewares/validar-roles');


const router = Router();


//RUtas para Admin y User

//En el front No esta agarrando el protect por eso se quito
router.post('/:id',[
        // protect,
        //  tieneRole('ADMIN_ROLE', 'USER_ROLE'),
], generarPdf );


router.post('/entrenamiento/cargarArchivo',[
        protect,
        tieneRole('ADMIN_ROLE', 'USER_ROLE'),
],pdfS, entrenamiendoNube)


module.exports = router;