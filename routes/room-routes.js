const express = require('express');
const router = express.Router();
const fbAuth = require('../middleware/fbAuth');
// controller
const roomController = require('../controllers/room-controller');
const prisma = require('../db/prisma');
const HttpError = require('../util/http-error');

router.post('/create', fbAuth, roomController.createRoom);
router.post('/join', fbAuth, roomController.joinRoom);
router.put('/leave/:uuid', fbAuth, roomController.leaveRoom);
router.get('/user/:uid/rooms', fbAuth, roomController.getRoomByUid);
router.get('/testing', fbAuth, async (req, res, next) => {
    let user;
    try {
        user = await prisma.user.findUnique({
            where: {
                uid: req.headers.uid
            },
            include: {
                rooms: true
            }
        })
    } catch (error) {
        console.log(error);
        return next(new HttpError('Error', 500));
    }

    res.json(user);
})

module.exports = router;