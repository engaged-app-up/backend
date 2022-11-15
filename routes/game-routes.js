const express = require('express');
const router = express.Router();
const fbAuth = require('../middleware/fbAuth');
const HttpError = require('../util/http-error');
const prism = require('../db/prisma');
const gameController = require('../controllers/game-controller');

// route to test emitting a socket eveent from a route.
// router.get('/test', gameController.test);
router.get('/questions', gameController.getQuestions);
router.post('/startgame', fbAuth, gameController.setIsGameActive)
module.exports = router;