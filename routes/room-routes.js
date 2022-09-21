const express = require('express');
const router = express.Router();
const fbAuth = require('../middleware/fbAuth');
// controller
const roomController = require('../controllers/room-controller');

router.post('/create', fbAuth, roomController.createRoom);

module.exports = router;