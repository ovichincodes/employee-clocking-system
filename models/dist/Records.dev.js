"use strict";

var mongoose = require("mongoose"); // records Schema


var recordsSchema = mongoose.Schema({
  status: {
    type: Number,
    // 1 for clock in, 0 for clock out
    required: true
  },
  // one to one relationship with Employees schema
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee"
  }
}, {
  timestamps: true
});
var Record = module.exports = mongoose.model("Record", recordsSchema);