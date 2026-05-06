const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const required = (body, fields) => {
  return fields.filter((field) => body[field] === undefined || body[field] === null || String(body[field]).trim() === "");
};

const slugify = (value) => {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const toJson = (value, fallback = []) => {
  if (value === undefined || value === null || value === "") return JSON.stringify(fallback);
  return typeof value === "string" ? value : JSON.stringify(value);
};

module.exports = { isEmail, required, slugify, toJson };
