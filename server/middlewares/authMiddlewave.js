import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      const resp = await User.findById(decodedToken.userId).select(
        "isAdmin email superadmin"
      );
      //*FOR SOLVING 304 ERROR
      res.set("Cache-Control", "no-store");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      req.user = {
        email: resp.email,
        superadmin: resp.superadmin,
        isAdmin: resp.isAdmin,
        userId: decodedToken.userId,
      };

      next();
    } else {
      return res
        .status(401)
        .json({ status: false, message: "Not authorized. Try login again." });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ status: false, message: "Not authorized. Try login again." });
  }
};

const isAdminRoute = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({
      status: false,
      message: "Not authorized as admin. Try login as admin.",
    });
  }
};

const isSuperAdminRoute = (req, res, next) => {
  if (req.user && req.user.superadmin) {
    next();
  } else {
    return res.status(401).json({
      status: false,
      message: "Not authorized. Superadmin privileges required.",
    });
  }
};

export { isAdminRoute, protectRoute, isSuperAdminRoute };
