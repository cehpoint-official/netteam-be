//JWT Token
const jwt = require("jsonwebtoken");

//Config
const config = require("../../config");

//Admin
const Admin = require("../admin/admin.model");

module.exports = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization");

    if (!Authorization)
      return res
        .status(403)
        .json({ status: false, message: "Oops ! You are not Authorized!!!!" });

    const decodeToken = await jwt.verify(Authorization, config.JWT_SECRET);

    const admin = await Admin.findById(decodeToken._id);

    req.admin = admin;

    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
