const prisma = require('../db/prisma');
const HttpError = require('../util/http-error');
const {getAuth} = require('firebase-admin/auth');
const { user } = require('../db/prisma');
const { v4: uuidv4 } = require('uuid');

const createRoom = async (req, res, next) => {
    console.log(req.headers.uid);
    const {name, description} = req.body;
    console.log(req.body);

    //get user trying to create room.
    let user;
    try {
         user = await prisma.user.findUnique({
            where: {
                uid: req.headers.uid
            }
        })
    } catch (error) {
        return next(new HttpError('Cannot create room. User not found.', 404))
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
    res.status(202).json(room);
};

const leaveRoom = async (req, res, next) => {
    //todo
};

const getRoomByUid= async (req, res, next) => {
    //uid from route params
    const uid = req.params.uid;
    let rooms = [];
    let user;
    try {
        user = await prisma.user.findUnique({
            where: {
                uid: uid
            },
            include: {
                ownedRooms: true,
                rooms: true
            }
        })
        rooms = rooms.concat(...user.ownedRooms, ...user.rooms);
    } catch (error) {
        return next(new HttpError('Failed to find user', 500));
    }
    res.json(rooms);
}

module.exports = {createRoom, deleteRoom, joinRoom, leaveRoom, getRoomByUid};