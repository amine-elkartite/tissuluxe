const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Accès administrateur requis", errors: null });
  }
  next();
};

module.exports = adminOnly;
