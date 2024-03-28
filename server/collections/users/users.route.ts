import { Express } from "express";
const express = require("express");

const router: Express = express.Router();

const { regsiterUser, login, getMe } = require("./users.controller");
const {
  protect,
  checkDuplicateEmail,
  rateLimiter,
} = require("../../middleware/authMiddleware");

router.post("/register", [rateLimiter, checkDuplicateEmail], regsiterUser);
router.post("/login", [rateLimiter], login);
router.get("/me", protect, getMe);

module.exports = router;
