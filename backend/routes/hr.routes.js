const express = require('express');
const { registerHRUser, loginHRUser } = require('../controllers/hr.controller');

const router = express.Router();

router.post('/register', registerHRUser);

router.post('/login', loginHRUser);

module.exports = router;

