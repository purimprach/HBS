const jwt = require("jsonwebtoken");

function authAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      return res.status(401).json({
        message: "Invalid authorization format"
      });
    }

    const [scheme, token] = parts;

    if (scheme !== "Bearer") {
      return res.status(401).json({
        message: "Invalid authorization scheme"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.system_role !== "admin") {
      return res.status(403).json({
        message: "Access denied: admin only"
      });
    }

    req.admin = decoded;
    next();

  } catch (error) {
    console.error("authAdmin error:", error);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

module.exports = authAdmin;