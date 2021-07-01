const express = require("express");
const moment = require("moment");

const router = express.Router();

// models
const Record = require("../models/Records");
const Employee = require("../models/Employees");

router.route("/test").post((req, res) => {
	Employee.updateOne(
		{ _id: "5fb60d4e7ba6b22be86d0188" },
		{
			$pull: {
				records: {
					$in: ["5fc0ec7bd6fff13408e5c179"],
				},
			},
		},
		(err) => {
			if (err) {
				console.log(err);
			} else {
				console.log("done");
			}
		}
	);
});

// create new employee clock in record
newRecord = (empID, res) => {
	const record = new Record();
	record.status = 1;
	record.employee = empID;
	// save this record to the collection of records
	record
		.save()
		.then(() => {
			// push this record into the records
			// array of the employee model
			Employee.findById(empID)
				.populate("records", null, null, {
					sort: { createdAt: -1 },
				})
				.exec((err, employee) => {
					if (err) {
						res.status(200).json({
							isCompleted: false,
							clockedIn: false,
							msg: err,
							employee,
						});
					} else {
						employee.records.push(record);
						employee.save((err) => {
							if (err) {
								res.status(200).json({
									isCompleted: false,
									clockedIn: false,
									msg: err,
									employee,
								});
							} else {
								res.status(200).json({
									isCompleted: true,
									clockedIn: false,
									msg: "Clock In Successful!",
									employee,
								});
							}
						});
					}
				});
		})
		.catch((err) => {
			res.status(200).json({
				isCompleted: false,
				clockedIn: false,
				msg: err,
			});
		});
};

// clock out an employee
router.route("/clock-out").post((req, res) => {
	let empID = req.body.empID;
	Record.find({ employee: empID }) // get all thhe records of an employee
		.then((record) => {
			if (record.length > 0) {
				// filter the records where the date is today
				const todaysRecord = record.filter(
					(rec) =>
						moment(moment()).format("MMMM Do, YYYY") ===
						moment(rec.createdAt).format("MMMM Do, YYYY")
				);
				if (todaysRecord.length > 0) {
					// employee has clocked in today and wants to clock out
					if (todaysRecord[0].status === 0) {
						// the employee has clocked out already
						res.status(200).json({
							isCompleted: false,
							msg: "You have clocked out already!",
						});
					} else {
						todaysRecord[0].status = 0;
						todaysRecord[0]
							.save()
							.then(() => {
								res.status(200).json({
									isCompleted: true,
									msg: "Clock out Successful!",
								});
							})
							.catch((err) => {
								res.status(200).json({
									isCompleted: false,
									msg: err,
								});
							});
					}
				} else {
					// employee has not clocked in today
					res.status(200).json({
						isCompleted: false,
						msg: "Sorry you've not clocked in!",
					});
				}
			} else {
				// clocking out when you dont have any records at all
				res.status(200).json({
					isCompleted: false,
					msg: "Sorry you've not clocked in!",
				});
			}
		})
		.catch((err) => {
			res.status(200).json({
				isCompleted: false,
				msg: err,
			});
		});
});

// clock in an employee for the day
router.route("/clock-in").post((req, res) => {
	let empID = req.body.empID;
	Record.find({ employee: empID }) // get all thhe records of an employee
		.then((record) => {
			if (record.length > 0) {
				// filter the records where the date is today
				const todaysRecord = record.filter(
					(rec) =>
						moment(moment()).format("MMMM Do, YYYY") ===
						moment(rec.createdAt).format("MMMM Do, YYYY")
				);
				if (todaysRecord.length > 0) {
					// if the employee has clocked in today already
					Employee.findById(empID)
						.populate("records", null, null, {
							sort: { createdAt: -1 },
						})
						.exec((err, employee) => {
							res.status(200).json({
								isCompleted: false,
								clockedIn: true,
								msg: "You Have Clocked In Today Already!",
								employee,
							});
						});
				} else {
					// if the employee has not clocked in today
					newRecord(empID, res);
				}
			} else {
				// the very first time the employee is clocking in for the day
				newRecord(empID, res);
			}
		})
		.catch((err) => {
			res.status(200).json({
				isCompleted: false,
				clockedIn: false,
				msg: err,
			});
		});
});

module.exports = router;
