const express = require('express');
const router = express.Router();
const {login, register, deleteAccount} = require('../controllers/account')

router.post('/login', login)
router.post('/register', register)
router.delete('/:id', deleteAccount)

module.exports = router;