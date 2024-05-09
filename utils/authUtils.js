import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const isValidUserData = (userData) => {
  return userData && userData.username && userData.password;
};
//TODO: Add expiresIn value before production
const generateAccessToken = (payLoad) => {
  return jwt.sign(payLoad, process.env.ACCESS_TOKEN_SECRET);
};

const generateRefreshToken = (payLoad) => {
  return jwt.sign(payLoad, process.env.REFRESH_TOKEN_SECRET);
};

export { isValidUserData, generateAccessToken, generateRefreshToken };
