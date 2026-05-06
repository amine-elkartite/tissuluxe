const express = require("express");
const controller = require("../controllers/wishlist.controller");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, controller.getWishlist);
router.post("/", protect, controller.addWishlist);
router.delete("/:productId", protect, controller.removeWishlist);

module.exports = router;
