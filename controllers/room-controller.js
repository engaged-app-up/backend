const prisma = require('../db/prisma');
const HttpError = require('../util/http-error');
const {getAuth} = require('firebase-admin/auth');
const { user } = require('../db/prisma');

const createRoom = async (req, res, next) => {
    const {name, description} = req.body;

    //get user trying to create room.
    let user;
    try {
         user = await prisma.user.findUnique({
            where: {
                uid: req.headers.uid
            },
            include: {
                ownedRooms: true,
            }
        })
        console.log(user);
    } catch (error) {
        return next(new HttpError('Cannot create room. User not found.', 500))
    }

    try {
        const room = await prisma.room.create({
            data: {
                name,
                description,
                creatorId: user.id
            }
        })
        console.log(room);
        console.log(user.ownedRooms);
    } catch (error) {
        return next(new HttpError('Failed to create room.\n' + error, 500));
    }

    //create room - TODO
    res.json({'msg': 'create room!'});
};

const deleteRoom = async (req, res, next) => {
    //todo
};

const joinRoom = async (req, res, next) => {
    //todo
};

const leaveRoom = async (req, res, next) => {
    //todo
};

module.exports = {createRoom, deleteRoom, joinRoom, leaveRoom};