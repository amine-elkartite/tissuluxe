const bcrypt = require("bcryptjs");
const { findOne, insert } = require("../models/dbHelpers");
const { signToken } = require("../utils/jwt");
const { isEmail, required } = require("../utils/validators");
const { success, error } = require("../utils/response");

const publicUser = (user) => ({
  id: user.id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  status: user.status
});

const register = async (req, res, next) => {
  try {
    const missing = required(req.body, ["first_name", "last_name", "email", "password"]);
    if (missing.length) return error(res, "Champs obligatoires manquants", missing, 422);
    if (!isEmail(req.body.email)) return error(res, "Email invalide", { email: "Format invalide" }, 422);
    if (String(req.body.password).length < 8) return error(res, "Le mot de passe doit contenir au moins 8 caractères", null, 422);

    const email = String(req.body.email).trim().toLowerCase();
    const exists = await findOne("SELECT id FROM users WHERE email = ?", [email]);
    if (exists) return error(res, "Cet email est déjà utilisé", null, 409);

    const password = await bcrypt.hash(req.body.password, 10);
    const id = await insert("users", {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email,
      phone: req.body.phone || null,
      password,
      role: "customer"
    });

    const user = await findOne("SELECT * FROM users WHERE id = ?", [id]);
    return success(res, "Compte créé avec succès", { user: publicUser(user), token: signToken(user) }, 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const missing = required(req.body, ["email", "password"]);
    if (missing.length) return error(res, "Email et mot de passe requis", missing, 422);

    const email = String(req.body.email).trim().toLowerCase();
    const user = await findOne("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return error(res, "Identifiants invalides", null, 401);
    if (user.status === "blocked") return error(res, "Compte bloqué", null, 403);

    const matches = await bcrypt.compare(req.body.password, user.password);
    if (!matches) return error(res, "Identifiants invalides", null, 401);

    return success(res, "Connexion réussie", { user: publicUser(user), token: signToken(user) });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => success(res, "Utilisateur connecté", { user: req.user });

const logout = async (_req, res) => success(res, "Déconnexion réussie", null);

module.exports = { register, login, me, logout };
