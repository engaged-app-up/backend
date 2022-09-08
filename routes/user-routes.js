const express = require('express');
const router = express.Router();

// controller
const userController = require('../controllers/user-controller');

router.get('/', userController.getUsers);

router.post('/auth/signup', userController.createUser);

module.exports = router;