const prisma = require('../db/prisma');
const HttpError = require('../util/http-error');
const { getAuth } = require('firebase-admin/auth');
const { user, room } = require('../db/prisma');

// route handler testing emiting socket event from route.
const test = async (req, res, next) => {
    const io = req.app.get('socketio');
    io.emit('test_from_route', { msg: 'from game controller' });
    res.status(201).json({ msg: 'hello world' });
}

const getQuestions = async (req, res, next) => {
    const dummyQuestions = [
        "Is there a spot in your house where you feel most productive?",
        "What would the title of your autobiography be?"
    ]
    res.json({ questions: dummyQuestions });
}

const setIsGameActive = async (req, res, next) => {
    let uid = req.headers.uid;

    let uuid = req.body.uuid;
    let value = req.body.value;

    let room;
    let user;

    //find user sending request.
    try {
        user = await prisma.user.findUnique({
            where: {
                uid: uid
            }
        })
    } catch (error) {
        return next(new HttpError('Failed to find user.', 404));
    }

    // find room.
    try {
        room = await prisma.room.findUnique({
            where: {
                uuid: uuid
            }
        })
    } catch (error) {
        return next(new HttpError('Failed to find room.', 404));
    }

    //if the user sending request is not the host/creator. Send error response.
    if (user.id != room.creatorId) {
        return next(new HttpError('You are not the room host.', 400));
    }

    try {
        room = await prisma.room.update({
            where: {
                uuid: uuid
            },
            data: {
                isGameActive: value
            }
        })
    } catch (error) {
        return next(new HttpError('Failed to update room.', 500));
    }
    return res.json({isGameActive: room.isGameActive});
    // res.json({ isRoomActive: room.isRoomActive });
}

module.exports = { test, getQuestions, setIsGameActive };