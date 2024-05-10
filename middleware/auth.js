import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const isAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (user.userType !== "admin")
      return res.status(401).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    req.user = user;
    next();
  });
};

const isStudent = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (user.userType !== "student")
      return res.status(401).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    req.user = user;
    next();
  });
};

const isTeacher = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (user.userType !== "teacher")
      return res.status(401).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    req.user = user;
    next();
  });
};

const isLoggedin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export { isAdmin, isStudent, isLoggedin, isTeacher };
