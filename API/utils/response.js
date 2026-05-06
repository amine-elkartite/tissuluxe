const success = (res, message = "OK", data = null, status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

const error = (res, message = "Une erreur est survenue", errors = null, status = 500) => {
  return res.status(status).json({ success: false, message, errors });
};

module.exports = { success, error };
