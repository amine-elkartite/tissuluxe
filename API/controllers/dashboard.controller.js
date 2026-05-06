const { query } = require("../models/dbHelpers");
const { success } = require("../utils/response");

const stats = async (_req, res, next) => {
  try {
    const [users] = await query("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'");
    const [products] = await query("SELECT COUNT(*) AS total FROM products WHERE status = 'active'");
    const [orders] = await query("SELECT COUNT(*) AS total, COALESCE(SUM(total),0) AS revenue FROM orders");
    const [pending] = await query("SELECT COUNT(*) AS total FROM orders WHERE status IN ('pending','confirmed','processing')");
    success(res, "Statistiques récupérées", {
      customers: users.total,
      products: products.total,
      orders: orders.total,
      revenue: Number(orders.revenue || 0),
      pending_orders: pending.total
    });
  } catch (err) {
    next(err);
  }
};

const sales = async (_req, res, next) => {
  try {
    const rows = await query(`
      SELECT DATE(created_at) AS day, COALESCE(SUM(total), 0) AS total, COUNT(*) AS orders
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `);
    success(res, "Ventes récupérées", rows);
  } catch (err) {
    next(err);
  }
};

const bestProducts = async (_req, res, next) => {
  try {
    const rows = await query(`
      SELECT product_id, product_name, SUM(quantity) AS quantity, SUM(total) AS revenue
      FROM order_items
      GROUP BY product_id, product_name
      ORDER BY quantity DESC
      LIMIT 8
    `);
    success(res, "Meilleurs produits récupérés", rows);
  } catch (err) {
    next(err);
  }
};

const recentOrders = async (_req, res, next) => {
  try {
    success(res, "Commandes récentes récupérées", await query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 8"));
  } catch (err) {
    next(err);
  }
};

module.exports = { stats, sales, bestProducts, recentOrders };
