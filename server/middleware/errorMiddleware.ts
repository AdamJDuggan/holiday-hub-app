// 3rd party
const { Request, Response, NextFunction } = require("express");
const asyncHandler = require("express-async-handler");

const isValidMongoId = asyncHandler(async (req: typeof Request, res: typeof Response, next: typeof NextFunction) => {
  if(req.params.id.match(/^[0-9a-fA-F]{24}$/)){
    next()
  } else {
    res.status(401)
    throw new Error("Invalid mongo id")
  }
});


const errorHandler = (err: Error, req: typeof Request, res: typeof Response) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  return res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
  isValidMongoId
};
