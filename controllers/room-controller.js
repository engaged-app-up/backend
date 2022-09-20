const prisma = require('../db/prisma');
const HttpError = require('../util/http-error');
const {getAuth} = require('firebase-admin/auth');

const createRoom = async (req, res, next) => {
    const roomDetails = req.body;

    //get user trying to create room.
    try {
        const user = await prisma.user.findUnique({
            where: {
                uid: req.headers.uid
            }
        })
        console.log(user);
    } catch (error) {
        return next(new HttpError('Cannot create room. User not found.', 500))
    }

    //create room - TODO
    res.json({'msg': 'create room!'});
}

module.exports = {createRoom};