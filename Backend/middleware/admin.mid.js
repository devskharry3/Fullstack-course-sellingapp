import jwt from "jsonwebtoken";
import config from "../config.js";

function adminMiddleware(req, res, next) {
  // Try to get token from Authorization header first
  const authHeader = req.headers.authorization;
  let token;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    // Fallback to cookie if header not available
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ errors: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_ADMIN_PASSWORD);
    req.adminId = decoded.id;
    next();
  } catch (error) {
    console.log("Error in admin middleware:", error);
    return res.status(401).json({ errors: "Invalid or expired token" });
  }
}

export default adminMiddleware;