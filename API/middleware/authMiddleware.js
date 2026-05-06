const { verifyToken } = require("../utils/jwt");
const { findOne } = require("../models/dbHelpers");

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentification requise", errors: null });
    }

    const decoded = verifyToken(token);
    const user = await findOne(
      "SELECT id, first_name, last_name, email, phone, role, avatar, status, created_at FROM users WHERE id = ?",
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: "Utilisateur introuvable", errors: null });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ success: false, message: "Compte bloqué", errors: null });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Session invalide ou expirée", errors: null });
  }
};

const optionalAuth = async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    req.user = await findOne(
      "SELECT id, first_name, last_name, email, phone, role, avatar, status FROM users WHERE id = ? AND status = 'active'",
      [decoded.id]
    );
  } catch (_err) {
    req.user = null;
  }
  next();
};

module.exports = { protect, optionalAuth };
