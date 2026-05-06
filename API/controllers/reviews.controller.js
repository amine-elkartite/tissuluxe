const { query, findOne, insert, updateById } = require("../models/dbHelpers");
const { success, error } = require("../utils/response");

const getProductReviews = async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    success(res, "Avis récupérés", rows);
  } catch (err) {
    next(err);
  }
};

const createReview = async (req, res, next) => {
  try {
    if (!req.body.product_id || !req.body.rating) return error(res, "Produit et note requis", null, 422);
    const id = await insert("reviews", {
      user_id: req.user.id,
      product_id: req.body.product_id,
      rating: Math.min(Math.max(parseInt(req.body.rating, 10), 1), 5),
      comment: req.body.comment || null,
      status: "pending"
    });
    success(res, "Avis envoyé pour modération", await findOne("SELECT * FROM reviews WHERE id = ?", [id]), 201);
  } catch (err) {
    next(err);
  }
};

const updateReviewStatus = async (req, res, next) => {
  try {
    const allowed = ["pending", "approved", "rejected"];
    if (!allowed.includes(req.body.status)) return error(res, "Statut invalide", allowed, 422);
    await updateById("reviews", req.params.id, { status: req.body.status });
    success(res, "Avis mis à jour", await findOne("SELECT * FROM reviews WHERE id = ?", [req.params.id]));
  } catch (err) {
    next(err);
  }
};

module.exports = { getProductReviews, createReview, updateReviewStatus };
