const express = require("express");
const moment = require("moment");
const router = express.Router();

// load the index page
router.route("/").get((req, res) => {
	res.render("pages/index", {
		title: "Home",
	});
});

// register page
router.route("/register").get((req, res) => {
	res.render("pages/register", {
		title: "Register Employee",
	});
});

// clock in page
router.route("/clock-in").get((req, res) => {
	res.render("pages/clock-in", {
		title: "Clock In",
	});
});

// clock out page
router.route("/clock-out").get((req, res) => {
	res.render("pages/clock-out", {
		title: "Clock Out",
	});
});

// emp details page after clock in
router.route("/emp-details").get((req, res) => {
	res.render("pages/emp-details", {
		title: "Employee Details",
		moment,
	});
});

module.exports = router;
