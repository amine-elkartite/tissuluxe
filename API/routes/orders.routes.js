const express = require("express");
const controller = require("../controllers/orders.controller");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", optionalAuth, controller.createOrder);
router.get("/", protect, adminOnly, controller.adminOrders);
router.get("/my-orders", protect, controller.myOrders);
router.get("/track/:orderNumber", controller.trackOrder);
router.get("/:orderNumber", controller.getOrder);
router.put("/:id/status", protect, adminOnly, controller.updateOrderStatus);

module.exports = router;
