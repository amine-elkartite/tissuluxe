const express = require("express");
const controller = require("../controllers/auth.controller");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", protect, controller.me);
router.post("/logout", protect, controller.logout);

module.exports = router;
