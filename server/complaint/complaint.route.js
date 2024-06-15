const express = require("express");
const multer = require("multer");
const route = express.Router();
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const ComplaintController = require("./complaint.controller");

var checkAccessWithKey = require("../../checkAccess");

//create complaint
route.post(
  "/create",
  checkAccessWithKey(),
  upload.single("image"),
  ComplaintController.store
);

//solve complaint
route.patch(
  "/complaintId",
  checkAccessWithKey(),
  ComplaintController.solveComplaint
);

//get user or host complaint for admin panel
route.get("/", checkAccessWithKey(), ComplaintController.userComplaint);

//get user complaint for android
route.get(
  "/userComplaintList",
  checkAccessWithKey(),
  ComplaintController.userComplaintList
);

//get user complaint for android
route.get(
  "/hostComplaintList",
  checkAccessWithKey(),
  ComplaintController.hostComplaintList
);

module.exports = route;
