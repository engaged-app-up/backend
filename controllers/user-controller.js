const prisma = require('../db/prisma');
const HttpError = require('../util/http-error');

const getUsers = async (req, res, next) => {
    const allUsers = await prisma.user.findMany();
    res.json(allUsers);
};

const createUser = async (req, res, next) => {
    const {uid, displayName, email} = req.body;
    const user = await prisma.user.create({
        data: {
            uid,
            displayName,
            email,
        }
    })
    .then(user => res.json(user))
    .catch(err => {
        next(new HttpError('Failed to create user.', 500));
    });
}


module.exports = {getUsers, createUser};