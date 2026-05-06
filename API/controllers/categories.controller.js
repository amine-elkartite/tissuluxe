const { query, findOne, insert, updateById } = require("../models/dbHelpers");
const { slugify } = require("../utils/validators");
const { success, error } = require("../utils/response");

const getCategories = async (_req, res, next) => {
  try {
    const rows = await query(`
      SELECT c.*, COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    success(res, "Catégories récupérées", rows);
  } catch (err) {
    next(err);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const row = await findOne("SELECT * FROM categories WHERE slug = ?", [req.params.slug]);
    if (!row) return error(res, "Catégorie introuvable", null, 404);
    success(res, "Catégorie récupérée", row);
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const name = req.body.name;
    if (!name) return error(res, "Le nom est obligatoire", null, 422);
    const id = await insert("categories", {
      name,
      slug: req.body.slug || slugify(name),
      description: req.body.description || null,
      image: req.body.image || null,
      status: req.body.status || "active"
    });
    success(res, "Catégorie créée", await findOne("SELECT * FROM categories WHERE id = ?", [id]), 201);
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const data = {};
    ["name", "description", "image", "status"].forEach((key) => {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    });
    if (req.body.slug) data.slug = req.body.slug;
    if (!req.body.slug && req.body.name) data.slug = slugify(req.body.name);

    const affected = await updateById("categories", req.params.id, data);
    if (!affected) return error(res, "Catégorie introuvable", null, 404);
    success(res, "Catégorie mise à jour", await findOne("SELECT * FROM categories WHERE id = ?", [req.params.id]));
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const affected = await updateById("categories", req.params.id, { status: "inactive" });
    if (!affected) return error(res, "Catégorie introuvable", null, 404);
    success(res, "Catégorie désactivée", null);
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
