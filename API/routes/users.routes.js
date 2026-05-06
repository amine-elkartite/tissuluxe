const express = require("express");
const controller = require("../controllers/users.controller");
const { protect } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, controller.listUsers);
router.put("/:id/status", protect, adminOnly, controller.updateUserStatus);
router.get("/profile", protect, controller.profile);
router.put("/profile", protect, controller.updateProfile);
router.put("/password", protect, controller.updatePassword);
router.get("/addresses", protect, controller.getAddresses);
router.post("/addresses", protect, controller.createAddress);
router.put("/addresses/:id", protect, controller.updateAddress);
router.delete("/addresses/:id", protect, controller.deleteAddress);

module.exports = router;
