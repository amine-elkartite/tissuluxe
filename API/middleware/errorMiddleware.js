const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route introuvable: ${req.originalUrl}`, errors: null });
};

const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Erreur serveur";
  if (process.env.NODE_ENV !== "test") {
    console.error(err);
  }
  res.status(status).json({
    success: false,
    message,
    errors: process.env.NODE_ENV === "production" ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };
