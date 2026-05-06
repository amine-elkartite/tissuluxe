const { db, query, findOne, insert, updateById } = require("../models/dbHelpers");
const { success, error } = require("../utils/response");
const { normalize } = require("./products.controller");

const cartOwnerWhere = (req) => {
  if (req.user) return { sql: "ci.user_id = ?", params: [req.user.id], data: { user_id: req.user.id, session_id: null } };
  const sessionId = req.headers["x-session-id"] || req.body.session_id;
  return { sql: "ci.session_id = ?", params: [sessionId || "guest"], data: { user_id: null, session_id: sessionId || "guest" } };
};

const getCart = async (req, res, next) => {
  try {
    const owner = cartOwnerWhere(req);
    const rows = await query(
      `SELECT ci.id AS cart_item_id, ci.quantity, p.*, c.name AS category_name, c.slug AS category_slug
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${owner.sql}
       ORDER BY ci.id DESC`,
      owner.params
    );
    const items = rows.map((row) => ({ id: row.cart_item_id, quantity: row.quantity, product: normalize(row) }));
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    success(res, "Panier récupéré", { items, subtotal, delivery_fee: subtotal > 500 ? 0 : 35, total: subtotal + (subtotal > 500 || subtotal === 0 ? 0 : 35) });
  } catch (err) {
    next(err);
  }
};

const addCartItem = async (req, res, next) => {
  try {
    if (!req.body.product_id) return error(res, "Produit requis", null, 422);
    const owner = cartOwnerWhere(req);
    const quantity = Math.max(parseInt(req.body.quantity || "1", 10), 1);
    const existing = await findOne(`SELECT id, quantity FROM cart_items ci WHERE ${owner.sql} AND product_id = ?`, [
      ...owner.params,
      req.body.product_id
    ]);
    if (existing) await updateById("cart_items", existing.id, { quantity: existing.quantity + quantity });
    else await insert("cart_items", { ...owner.data, product_id: req.body.product_id, quantity });
    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const owner = cartOwnerWhere(req);
    const quantity = Math.max(parseInt(req.body.quantity || "1", 10), 1);
    const [result] = await db.execute(`UPDATE cart_items ci SET quantity = ? WHERE ci.id = ? AND ${owner.sql}`, [
      quantity,
      req.params.id,
      ...owner.params
    ]);
    if (!result.affectedRows) return error(res, "Article introuvable", null, 404);
    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const owner = cartOwnerWhere(req);
    await query(`DELETE ci FROM cart_items ci WHERE ci.id = ? AND ${owner.sql}`, [req.params.id, ...owner.params]);
    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const owner = cartOwnerWhere(req);
    await query(`DELETE ci FROM cart_items ci WHERE ${owner.sql}`, owner.params);
    success(res, "Panier vidé", { items: [], subtotal: 0, delivery_fee: 0, total: 0 });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addCartItem, updateCartItem, removeCartItem, clearCart };
