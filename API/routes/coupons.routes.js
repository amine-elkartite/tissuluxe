const express = require("express");
const controller = require("../controllers/coupons.controller");
const { protect } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/validate", controller.validateCoupon);
router.get("/", protect, adminOnly, controller.listCoupons);
router.post("/", protect, adminOnly, controller.createCoupon);
router.put("/:id", protect, adminOnly, controller.updateCoupon);
router.delete("/:id", protect, adminOnly, controller.deleteCoupon);

module.exports = router;
