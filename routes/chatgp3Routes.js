const { Router } = require('express');
const {
       chatgp3L} = require('../controllers/chatgp3Controller')

const router = Router();

// router.post('/chat', chatgp3 )
router.post('/lambda', chatgp3L)



module.exports = router;