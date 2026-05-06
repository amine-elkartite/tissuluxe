const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const { success } = require("../utils/response");

const router = express.Router();

router.post("/product-image", protect, adminOnly, upload.single("image"), (req, res) => {
  success(res, "Image envoyée", {
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`
  }, 201);
});

module.exports = router;
