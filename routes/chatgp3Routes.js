const { Router } = require('express');
const {cloudPDFChatgpt,
       chatgp3L,
       deletePDFChatgpt} = require('../controllers/chatgp3Controller')

const router = Router();

router.post('/lambda', chatgp3L);
router.post('/cloudPDFChatgpt', cloudPDFChatgpt);
router.delete('/deletePDFChatgpt', deletePDFChatgpt)



module.exports = router;