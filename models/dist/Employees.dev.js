"use strict";

var mongoose = require("mongoose"); // employees Schema


var employeesSchema = mongoose.Schema({
  fname: {
    type: String,
    required: true
  },
  lname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  imageData: {
    type: String,
    required: true
  },
  // one to many relationship with Records schema
  records: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Record"
  }]
}, {
  timestamps: true
});
var Employee = module.exports = mongoose.model("Employee", employeesSchema);