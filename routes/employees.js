const express = require("express");
const fs = require("fs");
const path = require("path");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const router = express.Router();

// models
const Employee = require("../models/Employees");

// register new employee
router.route("/register").post(
	[
		check("fname")
			.not()
			.isEmpty()
			.trim()
			.withMessage("First Name is Required!"),
		check("lname")
			.not()
			.isEmpty()
			.trim()
			.withMessage("Last Name is Required!"),
		check("email").not().isEmpty().trim().withMessage("Email is Required!"),
		check("email").isEmail().withMessage("Invalid Email Format!"),
		check("email").custom((value, { req }) => {
			return new Promise((resolve, reject) => {
				Employee.findOne({ email: req.body.email }, (err, employee) => {
					if (err) {
						reject("Server Error");
					}
					if (Boolean(employee)) {
						reject(
							"<i class='fa fa-exclamation-circle'></i> E-mail already exist!"
						);
					}
					resolve(true);
				});
			});
		}),
		check("phone")
			.not()
			.isEmpty()
			.trim()
			.withMessage("Phone Number is Required!"),
		check("phone")
			.isLength({ min: 11, max: 11 })
			.withMessage("Invalid Phone Number!"),
		check("password").not().isEmpty().withMessage("Password is Required!"),
		check("password")
			.isLength({ min: 6 })
			.withMessage(
				"Password must be greater than or equal to 6 characters!"
			),
		check("imageData")
			.not()
			.isEmpty()
			.withMessage("Please Capture Your Face!"),
	],
	(req, res) => {
		// Check Errors from the validation
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			res.status(200).json({
				isCompleted: false,
				msg: errors.array(),
			});
		} else {
			// create a file and write to the file
			let path_to_imageData = `${req.body.fname}_${
				req.body.lname
			}_${Date.now()}.txt`;
			fs.writeFile(
				path.join(
					__dirname,
					"../public/storage/empImageData",
					path_to_imageData
				),
				`${req.body.imageData}`,
				(err) => {
					if (err) {
						res.status(200).json({
							isCompleted: false,
							msg:
								"<i class='fa fa-exclamation-circle'></i> Could not process Image at this time. Try Again!",
						});
					} else {
						let emp = new Employee({
							fname: req.body.fname,
							lname: req.body.lname,
							email: req.body.email,
							phone: req.body.phone,
							password: req.body.password,
							imageData: path_to_imageData,
						});
						// bcrypt or hash the password
						bcrypt.genSalt(10, (err, salt) => {
							if (err) {
								res.status(200).json({
									isCompleted: false,
									msg: err,
								});
							} else {
								bcrypt.hash(emp.password, salt, (err, hash) => {
									if (err) {
										res.status(200).json({
											isCompleted: false,
											msg: err,
										});
									} else {
										emp.password = hash;
										emp.save()
											.then(() => {
												res.status(200).json({
													isCompleted: true,
													msg:
														"<i class='fa fa-check-circle'></i> Employee Registered Successfully!",
												});
											})
											.catch((err) => {
												res.status(200).json({
													isCompleted: false,
													msg: err,
												});
											});
									}
								});
							}
						});
					}
				}
			);
		}
	}
);

// get all employees
router.route("/").get((req, res) => {
	Employee.find()
		.then((employees) => {
			res.status(200).json({
				isCompleted: true,
				employees,
			});
		})
		.catch((err) => {
			res.status(200).json({
				isCompleted: false,
				msg: err,
			});
		});
});

module.exports = router;
