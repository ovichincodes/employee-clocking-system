const mongoose = require("mongoose");
const conPath = require("./path");

// connect to mongo DB
mongoose.connect(conPath.database, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
var db = mongoose.connection;
// check for db errors
db.on("error", (err) => {
	console.log(err);
});
// check connection
db.once("open", () => {
	console.log("MongoDB Connected Successfully!");
});

module.exports = mongoose;
