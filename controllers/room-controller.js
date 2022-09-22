const prisma = require('../db/prisma');
const HttpError = require('../util/http-error');
const {getAuth} = require('firebase-admin/auth');
const { user } = require('../db/prisma');
const { v4: uuidv4 } = require('uuid');

const createRoom = async (req, res, next) => {
    console.log(req.headers.uid);
    const {name, description} = req.body;

    //get user trying to create room.
    let user;
    try {
         user = await prisma.user.findUnique({
            where: {
                uid: req.headers.uid
            }
        })
    } catch (error) {
        return next(new HttpError('Cannot create room. User not found.', 500))
    }

    let room;
    try {
        room = await prisma.room.create({
            data: {
                uuid: uuidv4(),
                name,
                description,
                creatorId: user.id
            }
        })
    } catch (error) {
        return next(new HttpError('Failed to create room.\n' + error, 500));
    }

    //create room - TODO
    res.json(room);
};

const deleteRoom = async (req, res, next) => {
    //todo
};

const joinRoom = async (req, res, next) => {
    //get user requesting to join
    let user;
    try {
        user = await prisma.user.findUnique({
            where: {
                uid: req.headers.uid
            }
        })
    } catch (error) {
        console.log(error)
        return next(new HttpError('Failed to find user', 500));
    }

    let room;
    try {
        room = await prisma.room.findUnique({
            where: {
                id: req.body.roomId
            }
        })
    } catch (error) {
        console.log(error)
        return next(new HttpError('Failed to find room', 500));
    }

    try {
        await prisma.room.update({
            where: {
                id: room.id
            },
            data: {
                members: {
                    connect: {
                        id: user.id
                    }
                }
            }
        })
    } catch (error) {
        console.log(error)
        return next(new HttpError('failed', 500));
    }
    res.json({msg: 'join successful'});
};

const leaveRoom = async (req, res, next) => {
    //todo
};

module.exports = {createRoom, deleteRoom, joinRoom, leaveRoom};