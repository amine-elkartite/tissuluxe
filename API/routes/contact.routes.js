const express = require("express");
const controller = require("../controllers/contact.controller");
const { protect } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", controller.createMessage);
router.get("/", protect, adminOnly, controller.getMessages);
router.put("/:id/status", protect, adminOnly, controller.updateMessageStatus);

module.exports = router;
