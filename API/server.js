require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = process.env.UPLOAD_DIR || "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : "*",
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, uploadDir)));

app.get("/", (_req, res) => {
  res.json({ success: true, message: "TissuLuxe API opérationnelle", data: { base: "/api" } });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/products", require("./routes/products.routes"));
app.use("/api/categories", require("./routes/categories.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/wishlist", require("./routes/wishlist.routes"));
app.use("/api/orders", require("./routes/orders.routes"));
app.use("/api/admin/orders", require("./routes/orders.routes"));
app.use("/api/reviews", require("./routes/reviews.routes"));
app.use("/api/contact", require("./routes/contact.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/coupons", require("./routes/coupons.routes"));
app.use("/api/upload", require("./routes/upload.routes"));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`TissuLuxe API prête sur http://localhost:${PORT}`);
});
