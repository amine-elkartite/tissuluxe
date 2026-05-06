const express = require("express");
const controller = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(protect, adminOnly);
router.get("/stats", controller.stats);
router.get("/sales", controller.sales);
router.get("/best-products", controller.bestProducts);
router.get("/recent-orders", controller.recentOrders);

module.exports = router;
