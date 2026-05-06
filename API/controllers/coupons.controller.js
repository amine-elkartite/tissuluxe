const { query, findOne, insert, updateById } = require("../models/dbHelpers");
const { success, error } = require("../utils/response");

const publicCoupon = (coupon) => ({
  id: coupon.id,
  code: coupon.code,
  type: coupon.type,
  value: Number(coupon.value || 0),
  min_order: Number(coupon.min_order || 0),
  expires_at: coupon.expires_at,
  status: coupon.status
});

const validateCoupon = async (req, res, next) => {
  try {
    const code = String(req.body.code || "").trim().toUpperCase();
    const subtotal = Number(req.body.subtotal || 0);
    if (!code) return error(res, "Code coupon requis", null, 422);

    const coupon = await findOne(
      `SELECT * FROM coupons
       WHERE code = ?
       AND status = 'active'
       AND (expires_at IS NULL OR expires_at >= CURDATE())
       AND (usage_limit IS NULL OR used_count < usage_limit)`,
      [code]
    );
    if (!coupon) return error(res, "Coupon invalide ou expiré", null, 404);
    if (subtotal < Number(coupon.min_order || 0)) {
      return error(res, `Minimum de commande requis: ${Number(coupon.min_order).toFixed(2)} MAD`, null, 422);
    }

    const discount = coupon.type === "percent"
      ? subtotal * (Number(coupon.value) / 100)
      : Number(coupon.value);

    success(res, "Coupon appliqué", {
      coupon: publicCoupon(coupon),
      discount: Math.min(discount, subtotal)
    });
  } catch (err) {
    next(err);
  }
};

const listCoupons = async (_req, res, next) => {
  try {
    success(res, "Coupons récupérés", await query("SELECT * FROM coupons ORDER BY created_at DESC"));
  } catch (err) {
    next(err);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    if (!req.body.code || !req.body.type || req.body.value === undefined) {
      return error(res, "Code, type et valeur requis", null, 422);
    }
    const id = await insert("coupons", {
      code: String(req.body.code).trim().toUpperCase(),
      type: req.body.type,
      value: Number(req.body.value || 0),
      min_order: Number(req.body.min_order || 0),
      usage_limit: req.body.usage_limit || null,
      used_count: Number(req.body.used_count || 0),
      expires_at: req.body.expires_at || null,
      status: req.body.status || "active"
    });
    success(res, "Coupon créé", await findOne("SELECT * FROM coupons WHERE id = ?", [id]), 201);
  } catch (err) {
    next(err);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    const data = {};
    ["code", "type", "value", "min_order", "usage_limit", "used_count", "expires_at", "status"].forEach((key) => {
      if (req.body[key] !== undefined) data[key] = key === "code" ? String(req.body[key]).trim().toUpperCase() : req.body[key];
    });
    const affected = await updateById("coupons", req.params.id, data);
    if (!affected) return error(res, "Coupon introuvable", null, 404);
    success(res, "Coupon mis à jour", await findOne("SELECT * FROM coupons WHERE id = ?", [req.params.id]));
  } catch (err) {
    next(err);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const affected = await updateById("coupons", req.params.id, { status: "inactive" });
    if (!affected) return error(res, "Coupon introuvable", null, 404);
    success(res, "Coupon désactivé", null);
  } catch (err) {
    next(err);
  }
};

module.exports = { validateCoupon, listCoupons, createCoupon, updateCoupon, deleteCoupon };
