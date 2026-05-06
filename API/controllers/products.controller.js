const { db, query, findOne, insert, updateById } = require("../models/dbHelpers");
const { slugify, toJson } = require("../utils/validators");
const { success, error } = require("../utils/response");

const parseJson = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value) || typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (_err) {
    return fallback;
  }
};

const normalize = (product) => {
  if (!product) return product;
  return {
    ...product,
    images: parseJson(product.images, []),
    colors: parseJson(product.colors, []),
    price: Number(product.price || 0),
    old_price: product.old_price === null ? null : Number(product.old_price),
    stock: Number(product.stock || 0),
    rating: Number(product.rating || 0),
    reviews_count: Number(product.reviews_count || 0)
  };
};

const baseSelect = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "12", 10), 1), 60);
    const offset = (page - 1) * limit;
    const where = ["p.status = 'active'"];
    const params = [];

    if (req.query.category) {
      where.push("c.slug = ?");
      params.push(req.query.category);
    }
    if (req.query.min) {
      where.push("p.price >= ?");
      params.push(Number(req.query.min));
    }
    if (req.query.max) {
      where.push("p.price <= ?");
      params.push(Number(req.query.max));
    }
    if (req.query.search) {
      where.push("(p.name LIKE ? OR p.description LIKE ? OR p.pattern LIKE ?)");
      const search = `%${req.query.search}%`;
      params.push(search, search, search);
    }
    if (req.query.color) {
      where.push("JSON_SEARCH(p.colors, 'one', ?) IS NOT NULL");
      params.push(req.query.color);
    }
    if (req.query.pattern) {
      where.push("p.pattern LIKE ?");
      params.push(`%${req.query.pattern}%`);
    }
    if (req.query.available === "true") where.push("p.stock > 0");

    const sortMap = {
      price_asc: "p.price ASC",
      price_desc: "p.price DESC",
      newest: "p.created_at DESC",
      best: "p.featured DESC, p.created_at DESC"
    };
    const orderBy = sortMap[req.query.sort] || "p.created_at DESC";
    const whereSql = `WHERE ${where.join(" AND ")}`;

    const [rows] = await db.execute(`${baseSelect} ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [
      ...params,
      limit,
      offset
    ]);
    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON c.id = p.category_id ${whereSql}`,
      params
    );

    success(res, "Produits récupérés", {
      products: rows.map(normalize),
      pagination: {
        page,
        limit,
        total: countRows[0].total,
        pages: Math.ceil(countRows[0].total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

const getFeatured = async (_req, res, next) => {
  try {
    const rows = await query(`${baseSelect} WHERE p.status = 'active' AND p.featured = 1 ORDER BY p.created_at DESC LIMIT 8`);
    success(res, "Produits en vedette récupérés", rows.map(normalize));
  } catch (err) {
    next(err);
  }
};

const searchProducts = async (req, res, next) => {
  req.query.search = req.query.q || req.query.search || "";
  return getProducts(req, res, next);
};

const getProduct = async (req, res, next) => {
  try {
    const product = await findOne(`${baseSelect} WHERE p.slug = ? AND p.status = 'active'`, [req.params.slug]);
    if (!product) return error(res, "Produit introuvable", null, 404);
    success(res, "Produit récupéré", normalize(product));
  } catch (err) {
    next(err);
  }
};

const getProductsByCategory = async (req, res, next) => {
  req.query.category = req.params.slug;
  return getProducts(req, res, next);
};

const productPayload = (body) => ({
  category_id: body.category_id || null,
  name: body.name,
  slug: body.slug || slugify(body.name),
  description: body.description || null,
  short_description: body.short_description || null,
  price: Number(body.price || 0),
  old_price: body.old_price ? Number(body.old_price) : null,
  stock: Number(body.stock || 0),
  sku: body.sku || null,
  main_image: body.main_image || null,
  images: toJson(body.images, []),
  material: body.material || null,
  width: body.width || null,
  weight: body.weight || null,
  pattern: body.pattern || null,
  colors: toJson(body.colors, []),
  usage_text: body.usage_text || null,
  rating: body.rating !== undefined ? Number(body.rating || 0) : 0,
  reviews_count: body.reviews_count !== undefined ? Number(body.reviews_count || 0) : 0,
  status: body.status || "active",
  featured: body.featured ? 1 : 0
});

const createProduct = async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.price) return error(res, "Nom et prix obligatoires", null, 422);
    const id = await insert("products", productPayload(req.body));
    success(res, "Produit créé", normalize(await findOne(`${baseSelect} WHERE p.id = ?`, [id])), 201);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const current = await findOne("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!current) return error(res, "Produit introuvable", null, 404);
    const payload = productPayload({ ...current, ...req.body });
    const allowed = Object.keys(req.body).reduce((acc, key) => {
      if (payload[key] !== undefined) acc[key] = payload[key];
      return acc;
    }, {});
    if (req.body.name && !req.body.slug) allowed.slug = slugify(req.body.name);
    await updateById("products", req.params.id, allowed);
    success(res, "Produit mis à jour", normalize(await findOne(`${baseSelect} WHERE p.id = ?`, [req.params.id])));
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const affected = await updateById("products", req.params.id, { status: "inactive" });
    if (!affected) return error(res, "Produit introuvable", null, 404);
    success(res, "Produit désactivé", null);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getFeatured, searchProducts, getProduct, getProductsByCategory, createProduct, updateProduct, deleteProduct, normalize };
