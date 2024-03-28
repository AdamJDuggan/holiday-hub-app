// 3rd party
const jwt = require("jsonwebtoken");
const { rateLimit } = require("express-rate-limit");
import asyncHandler from "express-async-handler";
const { Request, Response, NextFunction } = require("express");
// Models
const User = require("../collections/users/users.model");
const Session = require("../collections/sessions/sessions.model");

/**
 * Ensure a user has legitimate session cookie and auth token
 */
const protect = asyncHandler(
  async (
    req: typeof Request,
    res: typeof Response,
    next: typeof NextFunction
  ) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // Get token from header that starts with Bearer
        const token = req.headers.authorization.split(" ")[1];
        // Verify token
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        // Get MongoDB user from the token
        const mongoUser = await User.findById(decoded.id).select("-password");
        // Get user id from cookie
        const cookie = req.cookies["userId"];
        // Get session with same user id and cookie
        const session = await Session.findOne({ userId: mongoUser.id, cookie });

        if (mongoUser && session) {
          return next();
        } else {
          return res.status(401).json({ message: "NONE!!!" });
        }
      } catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authorized");
      }
    } else {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  }
);

const checkDuplicateEmail = (
  req: typeof Request,
  res: typeof Response,
  next: typeof NextFunction
) => {
  User.findOne({
    email: req.body.email,
  }).then((err: object, user: object) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      res.status(400).send({ message: "Email is already in use!" });
      return;
    }
    next();
  });
};

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per 15 minutes
});

module.exports = { protect, checkDuplicateEmail, rateLimiter };
