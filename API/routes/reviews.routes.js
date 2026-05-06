const express = require("express");
const controller = require("../controllers/reviews.controller");
const { protect } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/product/:productId", controller.getProductReviews);
router.post("/", protect, controller.createReview);
router.put("/:id/status", protect, adminOnly, controller.updateReviewStatus);

module.exports = router;
