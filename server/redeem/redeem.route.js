const express = require("express");
const router = express.Router();

const RedeemController = require("./redeem.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

// get redeem list [frontend]
router.get("/", RedeemController.index);

// get user redeem list
router.get("/user", RedeemController.userRedeem);

// get user redeem list
router.get("/debit", RedeemController.hostDebit);

// create redeem request
router.post("/", RedeemController.store);

// accept or decline the redeem request
router.patch("/:redeemId", RedeemController.update);

module.exports = router;
