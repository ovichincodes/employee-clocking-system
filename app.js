const express = require("express");
const path = require("path");

// bring in  database connection
require("./config/database/connection");

// Init app
const app = express();

// Load the view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Initialize the body parse middleware
app.use(express.json({ limit: "50MB" })); // handle raw json
app.use(express.urlencoded({ extended: false, limit: "5MB" })); // handle form submission

// set the public folder
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use(require("./routes/pages"));
app.use("/employees", require("./routes/records"));
app.use("/employees", require("./routes/employees"));

// check for available port or use 5000
const PORT = process.env.PORT || 5000;
// start the application on the selected port
app.listen(PORT, () => console.log(`Server Running on PORT ${PORT}...`));
