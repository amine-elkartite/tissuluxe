const express = require("express");
const controller = require("../controllers/products.controller");
const { protect } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", controller.getProducts);
router.get("/featured", controller.getFeatured);
router.get("/search", controller.searchProducts);
router.get("/category/:slug", controller.getProductsByCategory);
router.get("/:slug", controller.getProduct);
router.post("/", protect, adminOnly, controller.createProduct);
router.put("/:id", protect, adminOnly, controller.updateProduct);
router.delete("/:id", protect, adminOnly, controller.deleteProduct);

module.exports = router;
