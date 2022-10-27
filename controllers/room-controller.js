const prisma = require('../db/prisma');
const HttpError = require('../util/http-error');
const {getAuth} = require('firebase-admin/auth');
const { user } = require('../db/prisma');
const { v4: uuidv4 } = require('uuid');

const createRoom = async (req, res, next) => {
    console.log(req.headers.uid);
    const {name, description} = req.body;
    if (!name || !description) {
        return next(new HttpError('Failed to create room. You must provide a room name and description.', 400));
    }

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
    const roomUuid = req.body.roomUuid;
    let user;
    try {
        user = await prisma.user.findUnique({
            where: {
                uid: req.headers.uid
            },
        })
    } catch (error) {
        return next(new HttpError('Failed to find user', 500));
    }

    let room;
    try {
        room = await prisma.room.findUnique({
            where: {
                uuid: roomUuid
            }
        })
    } catch (error) {
        return next(new HttpError('Failed to find room', 500));
    }

    // is user already a member of the room?
    if (room.memberIds.includes(user.id) || room.creatorId === user.id) {
        return next(new HttpError(`You are already a member of this room.`, 409));
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
        return next(new HttpError('Join room failed.', 500));
    }
    res.status(202).json(room);
};

const leaveRoom = async (req, res, next) => {
    const uuid = req.params.uuid;
    let user;
    try {
        user = await prisma.user.findUnique({
            where: {
                uid: req.headers.uid
            }
        })
    } catch(error) {
        return next(new HttpError('Server failed to get user.', 500))
    }

    let room;
    try {
        room = await prisma.room.update({
            where: {
                uuid: uuid
            },
            data: {
                members: {
                    disconnect: {
                       id: user.id 
                    }
                }
            }
        })
    } catch(error) {
        return next(new HttpError('Server failed to get room.', 500));
    }

    res.status(202).json({msg: 'User left room.'});
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

const getRoomDetails= async (req, res, next) => {
    //room uuid from route params.
    const uuid = req.params.uuid;
    let room;
    try {
        room = await prisma.room.findUnique({
            where: {
                uuid: uuid
            },
            include: {
                members: true,
                creator: true
            }
        })
    } catch (error) {
        return next(new HttpError('Failed to find room.', 500));
    }
    res.json(room);
}

module.exports = {createRoom, deleteRoom, joinRoom, leaveRoom, getRoomByUid, getRoomDetails};