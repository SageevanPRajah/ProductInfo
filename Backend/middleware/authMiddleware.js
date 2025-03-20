import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { JWT_SECRET } from "../config.js";

// Protect routes
export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token,JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-hashed_password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Admin-only routes
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Object Creator-only routes
export const ObjectCreator = (req, res, next) => {
  if (req.user.role !== "Object Creator") {
    return res.status(403).json({ message: "Object Creator access required" });
  }
  next();
};

// Admin or Object Creator routes
export const adminOrObjectCreator = (req, res, next) => {
  if (req.user.role !== "Admin" && req.user.role !== "Object Creator") {
    return res.status(403).json({ message: "Admin or Object Creator access required" });
  }
  next();
};

