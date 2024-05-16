const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(express.json());
const port = 5001;

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Middleware for session management
app.use(
  session({
    secret: "passwortsafe2",
    resave: false,
    saveUninitialized: true,
  })
);

// Endpoint for user login
app.post("/api/login", (req, res) => {
  const { benutzername, passwort } = req.body;

  // Basic validation
  if (!benutzername || !passwort) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Read user data from data.json file
  fs.readFile("data.json", (err, data) => {
    if (err) {
      console.error("Error reading data file", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    try {
      const userData = JSON.parse(data).userdata;
      const user = userData.find(
        (user) =>
          user.benutzername === benutzername && user.passwort === passwort
      );

      // Check if user exists and password is correct
      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      // Set session data
      req.session.user = user;

      return res.status(200).json({ message: "Login successful" });
    } catch (error) {
      console.error("Error parsing user data", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
});

// Endpoint for user logout
app.post("/api/logout", (req, res) => {
  // Destroy session
  req.session.destroy();

  return res.status(200).json({ message: "Logout successful" });
});

// Endpoint to get all users
app.get("/api/users", (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Read user data from data.json file
  fs.readFile("data.json", (err, data) => {
    if (err) {
      console.error("Error reading data file", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    try {
      const userData = JSON.parse(data).userdata;
      return res.status(200).json(userData);
    } catch (error) {
      console.error("Error parsing user data", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
