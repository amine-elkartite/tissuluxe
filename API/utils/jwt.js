const jwt = require("jsonwebtoken");

const signToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "tissuluxe_super_secret_key",
    { expiresIn: "7d" }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "tissuluxe_super_secret_key");
};

module.exports = { signToken, verifyToken };
