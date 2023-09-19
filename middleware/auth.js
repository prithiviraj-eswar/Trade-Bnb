const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');


exports.protect = async (req, res, next) => {
    let token;
// for authentication bearing token / header. fetch the token and split it from auth
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }
/// check if token is available or just header was passed
    if(!token){
        return next(new ErrorResponse("Not Authorized to access this route", 401));
    }
// to find user based on id and token avaialble
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // the id itself is available in the token
        const user = await User.findById(decoded.id);

        if(!user){
            return next(new ErrorResponse("User not found with this ID!", 404));
        }
// This is important stuff
// If we found the correct user we assign it to req.user which will then be used to traverse/route to other 
// pages in the app.
        req.user = user;

        next();
    }catch(error){
        return next(new ErrorResponse("Not authorized to access this route", 401));
    }
}