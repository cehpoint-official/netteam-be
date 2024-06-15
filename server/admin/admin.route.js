//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const adminController = require("./admin.controller");

//admin middleware
const AdminMiddleware = require("../middleware/admin.middleware");

//Create Admin
route.post("/signup", adminController.store);

//update purchase code
route.patch("/updateCode", adminController.updateCode);

//admin login
route.post("/loginAdmin", adminController.login);

//get Profile
route.get("/adminData", AdminMiddleware, adminController.getAdminData);

//update email name
route.patch("/updateAdmin", AdminMiddleware, adminController.update);

//update admin Profile Image
route.patch("/updateImage", AdminMiddleware, upload.single("image"), adminController.updateImage);

//update admin Profile Image
route.put("/updatePassword", AdminMiddleware, adminController.updatePassword);

//Forget Password
route.post("/forgetPassword", adminController.forgotPassword);

//Set Password
route.post("/setPassword/:adminId", adminController.setPassword);

module.exports = route;
