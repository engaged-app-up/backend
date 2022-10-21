const prisma = require('../db/prisma');
const HttpError = require('../util/http-error');
const {getAuth} = require('firebase-admin/auth');

const getUsers = async (req, res, next) => {
    const uid = req.headers.uid; //uid of user that submitted request! Auth works! see fbAuth middleware.
    const allUsers = await prisma.user.findMany();
    res.json(allUsers);
};

const createUser = async (req, res, next) => {
    try {
        //initial info submitted by user
        const {email, displayName, password} = req.body;

        //creating firebase user.
        let createdUser = await getAuth().createUser({
            email,
            displayName,
            password,
            photoURL: 'https://miro.medium.com/max/720/1*W35QUSvGpcLuxPo3SRTH4w.png',
        })
        console.log(createdUser.displayName);

        //creating user in mongoDB.
        createdUser = await prisma.user.create({
            data: {
                uid: createdUser.uid,
                displayName: createdUser.displayName,
                email: createdUser.email
            }
        })
        res.json(createdUser);
    } catch (error) {
        next(new HttpError(error.message, 500))
    }
}

const getDbId = async (req, res, next) => {
    const uid = req.params.uid;
    let user;
    try {
        user = await prisma.user.findUnique({
            where: {
                uid: uid
            }
        })
    } catch (error) {
        return next(new HttpError('User not found', 404));
    }

    res.json({id: user.id});
}


module.exports = { getUsers, createUser, getDbId };