const { query, findOne, insert } = require("../models/dbHelpers");
const { success, error } = require("../utils/response");
const { normalize } = require("./products.controller");

const getWishlist = async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT w.id AS wishlist_id, p.*, c.name AS category_name, c.slug AS category_slug
       FROM wishlist w
       JOIN products p ON p.id = w.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE w.user_id = ?
       ORDER BY w.id DESC`,
      [req.user.id]
    );
    success(res, "Favoris récupérés", rows.map((row) => ({ id: row.wishlist_id, product: normalize(row) })));
  } catch (err) {
    next(err);
  }
};

const addWishlist = async (req, res, next) => {
  try {
    if (!req.body.product_id) return error(res, "Produit requis", null, 422);
    const exists = await findOne("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?", [req.user.id, req.body.product_id]);
    if (!exists) await insert("wishlist", { user_id: req.user.id, product_id: req.body.product_id });
    getWishlist(req, res, next);
  } catch (err) {
    next(err);
  }
};

const removeWishlist = async (req, res, next) => {
  try {
    await query("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", [req.user.id, req.params.productId]);
    getWishlist(req, res, next);
  } catch (err) {
    next(err);
  }
};

module.exports = { getWishlist, addWishlist, removeWishlist };
