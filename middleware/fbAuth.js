const { getAuth } = require('firebase-admin/auth');
const HttpError = require('../util/http-error');

const fbAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = req.headers.authorization.split(' ')[1];
    if (!authHeader || !authHeader.startsWith('Bearer ') || !token) {
       return next(new HttpError('Not Authorized', 403));
    }
    next();
}

module.exports = fbAuth;