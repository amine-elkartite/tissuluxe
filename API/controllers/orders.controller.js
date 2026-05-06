const { db, query, findOne, updateById } = require("../models/dbHelpers");
const { success, error } = require("../utils/response");

const generateOrderNumber = () => `TLX-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

const statusSteps = {
  pending: 1,
  confirmed: 2,
  processing: 3,
  shipped: 4,
  delivered: 5,
  cancelled: 0
};

const ownerWhere = (req) => {
  if (req.user) return { sql: "user_id = ?", params: [req.user.id] };
  return { sql: "session_id = ?", params: [req.headers["x-session-id"] || req.body.session_id || "guest"] };
};

const createOrder = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const required = ["customer_name", "email", "phone", "address", "city", "payment_method"];
    const missing = required.filter((field) => !req.body[field]);
    if (missing.length) return error(res, "Informations de commande incomplètes", missing, 422);

    const cartOwner = ownerWhere(req);
    const [cartRows] = await connection.execute(
      `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock, p.main_image
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ${cartOwner.sql}`,
      cartOwner.params
    );
    if (!cartRows.length) return error(res, "Le panier est vide", null, 422);

    const subtotal = cartRows.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const deliveryFee = req.body.delivery_fee !== undefined ? Number(req.body.delivery_fee) : subtotal > 500 ? 0 : 35;
    let discount = 0;
    let couponId = null;
    if (req.body.coupon_code) {
      const [couponRows] = await connection.execute(
        `SELECT * FROM coupons
         WHERE code = ?
         AND status = 'active'
         AND (expires_at IS NULL OR expires_at >= CURDATE())
         AND (usage_limit IS NULL OR used_count < usage_limit)`,
        [String(req.body.coupon_code).trim().toUpperCase()]
      );
      const coupon = couponRows[0];
      if (coupon && subtotal >= Number(coupon.min_order || 0)) {
        couponId = coupon.id;
        discount = coupon.type === "percent" ? subtotal * (Number(coupon.value) / 100) : Number(coupon.value);
        discount = Math.min(discount, subtotal);
      }
    } else {
      discount = Math.max(Number(req.body.discount || 0), 0);
    }
    const total = subtotal + deliveryFee - discount;
    const orderNumber = generateOrderNumber();

    await connection.beginTransaction();
    const [orderResult] = await connection.execute(
      `INSERT INTO orders
       (user_id, order_number, customer_name, email, phone, address, city, postal_code, country, delivery_method, payment_method, subtotal, delivery_fee, discount, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        req.user ? req.user.id : null,
        orderNumber,
        req.body.customer_name,
        req.body.email,
        req.body.phone,
        req.body.address,
        req.body.city,
        req.body.postal_code || null,
        req.body.country || "Maroc",
        req.body.delivery_method || "standard",
        req.body.payment_method,
        subtotal,
        deliveryFee,
        discount,
        total
      ]
    );

    for (const item of cartRows) {
      await connection.execute(
        "INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, total) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [orderResult.insertId, item.product_id, item.name, item.main_image, item.price, item.quantity, Number(item.price) * Number(item.quantity)]
      );
      await connection.execute("UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?", [item.quantity, item.product_id]);
    }

    if (couponId) {
      await connection.execute("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?", [couponId]);
    }

    await connection.execute(`DELETE FROM cart_items WHERE ${cartOwner.sql}`, cartOwner.params);
    await connection.commit();

    const order = await getOrderWithItems(orderNumber);
    success(res, "Commande créée", order, 201);
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

const getOrderWithItems = async (orderNumber) => {
  const order = await findOne("SELECT * FROM orders WHERE order_number = ?", [orderNumber]);
  if (!order) return null;
  order.items = await query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
  order.timeline = buildTimeline(order.status);
  return order;
};

const buildTimeline = (status) => {
  const current = statusSteps[status] || 0;
  return [
    { key: "pending", label: "Commandée", done: current >= 1 },
    { key: "confirmed", label: "Confirmée", done: current >= 2 },
    { key: "processing", label: "Préparée", done: current >= 3 },
    { key: "shipped", label: "Expédiée", done: current >= 4 },
    { key: "delivered", label: "Livrée", done: current >= 5 }
  ];
};

const myOrders = async (req, res, next) => {
  try {
    const rows = await query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
    success(res, "Commandes récupérées", rows);
  } catch (err) {
    next(err);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await getOrderWithItems(req.params.orderNumber);
    if (!order) return error(res, "Commande introuvable", null, 404);
    success(res, "Commande récupérée", order);
  } catch (err) {
    next(err);
  }
};

const trackOrder = getOrder;

const updateOrderStatus = async (req, res, next) => {
  try {
    const allowed = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(req.body.status)) return error(res, "Statut invalide", allowed, 422);
    const data = { status: req.body.status };
    if (req.body.tracking_number !== undefined) data.tracking_number = req.body.tracking_number;
    const affected = await updateById("orders", req.params.id, data);
    if (!affected) return error(res, "Commande introuvable", null, 404);
    success(res, "Statut mis à jour", await findOne("SELECT * FROM orders WHERE id = ?", [req.params.id]));
  } catch (err) {
    next(err);
  }
};

const adminOrders = async (_req, res, next) => {
  try {
    const rows = await query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 200");
    success(res, "Commandes admin récupérées", rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, myOrders, getOrder, trackOrder, updateOrderStatus, adminOrders };
