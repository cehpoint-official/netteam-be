const express = require("express");
const route = express.Router();

const ViewStoryController = require("./viewStory.controller");

const checkAccessWithSecretKey = require("../../checkAccess");

//create viewUser of story
route.post("/create", checkAccessWithSecretKey(), ViewStoryController.viewUser);

module.exports = route;
