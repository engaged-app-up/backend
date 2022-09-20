const { getAuth } = require('firebase-admin/auth');
const HttpError = require('../util/http-error');

const fbAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader ? req.headers.authorization.split(' ')[1] : null;
    if (!authHeader || !authHeader.startsWith('Bearer ') || !token) { //if no valid authHeader/invalid auth header. pass error to error handler
       return next(new HttpError('Not Authorized', 403));
    }

    //TODO: verify auth token
    try {
        const verified = await getAuth().verifyIdToken(token); //verifying the token is legit with firebase ADMIN sdk. 
        req.headers.uid = verified.uid; // attach uid of the authorized user to the headers. 
    } catch (error) {
        return next(new HttpError('Failed to Authorize', 403)); // if token was not verified pass error to the custom error handler
    }
    next(); // moving to next middleware if everything is good.
}

module.exports = fbAuth;