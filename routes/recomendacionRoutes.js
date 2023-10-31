const { Router } = require("express")
const router = Router();
const {createCategory, getCategories, getCategory, updateCategory} = require('../controllers/recomendacionController')
const {imprimeCategoria} = require('../middlewares/category')

router.route('/categoria')
.post(createCategory)
.get(getCategories)

router.route('/categoria/:id')
.get(getCategory)
.put(updateCategory)

router.route('/getCategory')
.get(imprimeCategoria)

module.exports = router;

