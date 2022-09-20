const express = require('express');
const router = express.Router();
const fbAuth = require('../middleware/fbAuth');
// controller
const userController = require('../controllers/user-controller');

router.get('/', fbAuth, userController.getUsers);

router.post('/auth', userController.createUser);

module.exports = router;