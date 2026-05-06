const express = require("express");
const controller = require("../controllers/cart.controller");
const { optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", optionalAuth, controller.getCart);
router.post("/", optionalAuth, controller.addCartItem);
router.put("/:id", optionalAuth, controller.updateCartItem);
router.delete("/:id", optionalAuth, controller.removeCartItem);
router.delete("/", optionalAuth, controller.clearCart);

module.exports = router;
