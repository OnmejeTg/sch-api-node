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
    console.log(user);
    next();
  });
};

export { isAdmin };
