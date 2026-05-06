const { query, findOne, insert, updateById } = require("../models/dbHelpers");
const { success, error } = require("../utils/response");
const { isEmail, required } = require("../utils/validators");

const createMessage = async (req, res, next) => {
  try {
    const missing = required(req.body, ["name", "email", "subject", "message"]);
    if (missing.length) return error(res, "Champs obligatoires manquants", missing, 422);
    if (!isEmail(req.body.email)) return error(res, "Email invalide", null, 422);
    const id = await insert("contact_messages", {
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
      status: "new"
    });
    success(res, "Message envoyé", await findOne("SELECT * FROM contact_messages WHERE id = ?", [id]), 201);
  } catch (err) {
    next(err);
  }
};

const getMessages = async (_req, res, next) => {
  try {
    success(res, "Messages récupérés", await query("SELECT * FROM contact_messages ORDER BY created_at DESC"));
  } catch (err) {
    next(err);
  }
};

const updateMessageStatus = async (req, res, next) => {
  try {
    const allowed = ["new", "read", "replied"];
    if (!allowed.includes(req.body.status)) return error(res, "Statut invalide", allowed, 422);
    await updateById("contact_messages", req.params.id, { status: req.body.status });
    success(res, "Message mis à jour", await findOne("SELECT * FROM contact_messages WHERE id = ?", [req.params.id]));
  } catch (err) {
    next(err);
  }
};

module.exports = { createMessage, getMessages, updateMessageStatus };
