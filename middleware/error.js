// Whenever we call next and we pass it some error, it automatically gets synced with the errorhandler middleware
// all our responses to a query will come from error handler
const { is } = require('express/lib/request');
const ErrorResponse = require('../utils/errorResponse');

const errorhandler = (err, req, res, next) => {
    // to spread the error we get from params in the below mentioned variable 
    let error = {...err};

    error.message = err.message;

    // console.log(err);
// because in mongoose 11000 means duplicate error key
    if(err.code === 11000){
        const message = `duplicate field valu entered`;
        error = new ErrorResponse(message, 400);
    }
// to capture validation error from mongoose, we will capture object of all values and traverse it using map
    if(err.name === "ValidationError"){
        const message = Object.values(err.errors).map((val)=>val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(err.statusCode || 500)({
        success:false,
        error: error.message || "Server Error"
    });
};

module.exports = errorhandler;

// next we take this errorHandler to server.js