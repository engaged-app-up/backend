const prisma = require('../db/prisma');
const HttpError = require('../middleware/http-error');

const getUsers = async (req, res, next) => {
    const allUsers = await prisma.user.findMany();
    res.json(allUsers);
};

const createUser = async (req, res, next) => {
    const user = await prisma.user.create({
        data: {
            firebase_uid: "123456",
            email: "test@test3.com",
            password: "lol123",
            name: "Test",
            role: "user"
        }
    })
    .then(user => res.json(user))
    .catch(err => {
        next(new HttpError('Failed to create user', 500));
    });
}


module.exports = {getUsers, createUser};