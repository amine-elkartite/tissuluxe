const bcrypt = require("bcryptjs");
const { query, findOne, insert, updateById } = require("../models/dbHelpers");
const { success, error } = require("../utils/response");

const profile = async (req, res) => success(res, "Profil récupéré", req.user);

const updateProfile = async (req, res, next) => {
  try {
    const data = {};
    ["first_name", "last_name", "phone", "avatar"].forEach((key) => {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    });
    await updateById("users", req.user.id, data);
    const user = await findOne("SELECT id, first_name, last_name, email, phone, role, avatar, status, created_at FROM users WHERE id = ?", [
      req.user.id
    ]);
    success(res, "Profil mis à jour", user);
  } catch (err) {
    next(err);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    if (!req.body.current_password || !req.body.password) return error(res, "Mot de passe actuel et nouveau requis", null, 422);
    const user = await findOne("SELECT password FROM users WHERE id = ?", [req.user.id]);
    const matches = await bcrypt.compare(req.body.current_password, user.password);
    if (!matches) return error(res, "Mot de passe actuel incorrect", null, 422);
    await updateById("users", req.user.id, { password: await bcrypt.hash(req.body.password, 10) });
    success(res, "Mot de passe modifié", null);
  } catch (err) {
    next(err);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    success(res, "Adresses récupérées", await query("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC", [req.user.id]));
  } catch (err) {
    next(err);
  }
};

const createAddress = async (req, res, next) => {
  try {
    if (req.body.is_default) await query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [req.user.id]);
    const id = await insert("addresses", {
      user_id: req.user.id,
      label: req.body.label || "Adresse",
      full_name: req.body.full_name || `${req.user.first_name} ${req.user.last_name}`,
      phone: req.body.phone || req.user.phone,
      address: req.body.address,
      city: req.body.city,
      postal_code: req.body.postal_code || null,
      country: req.body.country || "Maroc",
      is_default: req.body.is_default ? 1 : 0
    });
    success(res, "Adresse ajoutée", await findOne("SELECT * FROM addresses WHERE id = ?", [id]), 201);
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const current = await findOne("SELECT id FROM addresses WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!current) return error(res, "Adresse introuvable", null, 404);
    if (req.body.is_default) await query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [req.user.id]);
    const data = {};
    ["label", "full_name", "phone", "address", "city", "postal_code", "country", "is_default"].forEach((key) => {
      if (req.body[key] !== undefined) data[key] = key === "is_default" ? (req.body[key] ? 1 : 0) : req.body[key];
    });
    await updateById("addresses", req.params.id, data);
    success(res, "Adresse mise à jour", await findOne("SELECT * FROM addresses WHERE id = ?", [req.params.id]));
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    await query("DELETE FROM addresses WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    success(res, "Adresse supprimée", null);
  } catch (err) {
    next(err);
  }
};

const listUsers = async (_req, res, next) => {
  try {
    const rows = await query("SELECT id, first_name, last_name, email, phone, role, avatar, status, created_at FROM users ORDER BY created_at DESC");
    success(res, "Utilisateurs récupérés", rows);
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const allowed = ["active", "blocked"];
    if (!allowed.includes(req.body.status)) return error(res, "Statut invalide", allowed, 422);
    const affected = await updateById("users", req.params.id, { status: req.body.status });
    if (!affected) return error(res, "Utilisateur introuvable", null, 404);
    success(res, "Statut utilisateur mis à jour", await findOne("SELECT id, first_name, last_name, email, phone, role, avatar, status, created_at FROM users WHERE id = ?", [req.params.id]));
  } catch (err) {
    next(err);
  }
};

module.exports = { profile, updateProfile, updatePassword, getAddresses, createAddress, updateAddress, deleteAddress, listUsers, updateUserStatus };
