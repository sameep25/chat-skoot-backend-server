import jwt from "jsonwebtoken";
import User from "../schema/userSchema.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // token is in req headers inside authriztion and is a Bearer token in form -> Bearer lkjnsadkjfnkdsjanf
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]; //split Bearer part of token
      // decodes the token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decodedToken);
      req.user = await User.findById(decodedToken.id).select("-password"); //return user without password
      next();
      return;
    }
    if (token) {
      throw new Error("Not authorized ,token failed");
    }
    if (!token) {
      throw new Error("Not authorized ,no token");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
