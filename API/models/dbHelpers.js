const db = require("../config/db");

const query = async (sql, params = []) => {
  const [rows] = await db.execute(sql, params);
  return rows;
};

const findOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] || null;
};

const insert = async (table, data) => {
  const keys = Object.keys(data);
  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
  const [result] = await db.execute(sql, keys.map((key) => data[key]));
  return result.insertId;
};

const updateById = async (table, id, data) => {
  const keys = Object.keys(data);
  if (!keys.length) return 0;
  const assignments = keys.map((key) => `${key} = ?`).join(", ");
  const values = keys.map((key) => data[key]);
  const [result] = await db.execute(`UPDATE ${table} SET ${assignments} WHERE id = ?`, [...values, id]);
  return result.affectedRows;
};

module.exports = { db, query, findOne, insert, updateById };
