const express = require("express");
const controller = require("../controllers/categories.controller");
const { protect } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", controller.getCategories);
router.get("/:slug", controller.getCategory);
router.post("/", protect, adminOnly, controller.createCategory);
router.put("/:id", protect, adminOnly, controller.updateCategory);
router.delete("/:id", protect, adminOnly, controller.deleteCategory);

module.exports = router;
