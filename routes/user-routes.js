const express = require('express');
const router = express.Router();
const fbAuth = require('../middleware/fbAuth');
// controller
const userController = require('../controllers/user-controller');

router.get('/', fbAuth, userController.getUsers);

router.get('/:uid/dbId', fbAuth, userController.getDbId);

router.get('/dbuser', fbAuth, userController.getDbUser);

router.post('/auth', userController.createUser);

module.exports = router;