const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5001;
const SECRET_KEY =
  "a12f3a059f1fe7fce1b7e1539bb776fc083e6fce8e88998c708ca12a6d8e30d3";

app.use(bodyParser.json());
app.use(cors());

function createData(link, username, password) {
  return { link, username, password };
}

let users = [
  { id: 1, username: "user1", password: "password1" },
  { id: 2, username: "user2", password: "password2" },
];

const rows = [
  { link: "google.com", username: "fabian", password: "hjer" },
  { link: "abc.com", username: "fabian", password: "ergerg" },
  { link: "cdf.com", username: "fabian", password: "erg" },
  { link: "web.com", username: "fabian", password: "rthrytjh" },
  { link: "123.com", username: "fabian", password: "hjurtbh" },
];

// Anmelderoute
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } else {
    res.status(401).json({ message: "Ungültige Anmeldedaten" });
  }
});

// Registrierungsroute
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const userExists = users.some((u) => u.username === username);

  if (userExists) {
    res.status(400).json({ message: "Benutzername existiert bereits" });
  } else {
    const newUser = { id: users.length + 1, username, password };
    users.push(newUser);
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token });
  }
});

// Geschützte Route
app.get("/protected", (req, res) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Kein Token bereitgestellt" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ message: "Geschützte Daten", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Ungültiges Token" });
  }
});

// Benutzerdaten aktualisieren
app.put("/update", (req, res) => {
  const token = req.headers["authorization"];
  const { username, password } = req.body;

  if (!token) {
    return res.status(403).json({ message: "Kein Token bereitgestellt" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = users.find((u) => u.id === decoded.id);
    if (user) {
      user.username = username || user.username;
      user.password = password || user.password;
      res.json({ message: "Benutzerdaten aktualisiert" });
    } else {
      res.status(404).json({ message: "Benutzer nicht gefunden" });
    }
  } catch (error) {
    res.status(401).json({ message: "Ungültiges Token" });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
