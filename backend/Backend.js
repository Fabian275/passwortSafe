const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 5001;
const SECRET_KEY =
  "a12f3a059f1fe7fce1b7e1539bb776fc083e6fce8e88998c708ca12a6d8e30d3";
const ENCRYPTION_KEY = Buffer.from(
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "hex"
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
const IV_LENGTH = 16;

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};
let users = [
  {
    id: 1,
    username: "user1",
    password: hashPassword("password1"),
  },
  {
    id: 2,
    username: "user2",
    password: hashPassword("password2"),
  },
];

let encryptionMasterPasswordHash = null;

// Funktion zum Verschlüsseln eines Werts
const encryptValue = (value) => {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

let passwords = [
  {
    userId: 1,
    entries: [
      {
        link: "google.com",
        username: encryptValue("user1name"),
        password: encryptValue("password1"),
      },
      {
        link: "abc.com",
        username: encryptValue("user1name"),
        password: encryptValue("password2"),
      },
    ],
  },
  {
    userId: 2,
    entries: [
      {
        link: "web.com",
        username: encryptValue("user2name"),
        password: encryptValue("password3"),
      },
    ],
  },
];

const encryptionMasterPassword = (password) => {
  return crypto.createHash("md5").update(password).digest("hex");
};

// Funktion zum Entschlüsseln eines Werts
const decryptValue = (value) => {
  let textParts = value.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  if (iv.length !== IV_LENGTH) {
    throw new Error("Invalid IV length");
  }
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ message: "Kein Token bereitgestellt" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Ungültiges Token" });
  }
}

// Anmelderoute
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = hashPassword(password);
  const user = users.find(
    (u) => u.username === username && u.password === hashedPassword
  );

  if (user) {
    const token = jwt.sign(
      { id: user.id, username: user.username, key: encryptionMasterPassword(password) },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
    });
    res.json({ message: "Anmeldung erfolgreich", token });
  } else {
    res.status(401).json({ message: "Ungültige Anmeldedaten" });
  }
});

// Registrierungsroute
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const userExists = users.some((u) => u.username === username);
  const hashedPassword = hashPassword(password);

  if (userExists) {
    res.status(400).json({ message: "Benutzername existiert bereits" });
  } else {
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
    };
    users.push(newUser);
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    encryptionMasterPasswordHash = encryptionMasterPassword(password);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
    });
    res.json({ message: "Registrierung erfolgreich", token });
  }
});

// add new password
app.post("/addNewPassword", authenticateToken, (req, res) => {
  const { link, username, password } = req.body;
  const encryptedPassword = encryptValue(password);
  const encryptedUsername = encryptValue(username);

  const userPasswords = passwords.find((pw) => pw.userId === req.user.id);
  if (userPasswords) {
    userPasswords.entries.push({
      link,
      username: encryptedUsername,
      password: encryptedPassword,
    });
  } else {
    passwords.push({
      userId: req.user.id,
      entries: [
        { link, username: encryptedUsername, password: encryptedPassword },
      ],
    });
  }

  res.json({ message: "Neues Passwort hinzugefügt" });
});

// get password
app.get("/getPasswords", authenticateToken, (req, res) => {
  try {
    const userPasswords = passwords.find((pw) => pw.userId === req.user.id);
    if (!userPasswords) {
      return res.json([]);
    }

    const decryptedPasswords = userPasswords.entries.map((entry) => ({
      link: entry.link,
      username: decryptValue(entry.username),
      password: decryptValue(entry.password),
    }));

    res.json(decryptedPasswords);
  } catch (error) {
    res.status(500).json({
      message: "Fehler beim Entschlüsseln der Daten",
      error: error.message,
    });
  }
});

app.put("/updatePassword", authenticateToken, (req, res) => {
  const { id, link, username, password } = req.body;

  if (!link || !username || !password) {
    return res
      .status(400)
      .json({ message: "Alle Felder müssen ausgefüllt werden." });
  }

  const userPasswords = passwords.find((user) => user.userId === req.user.id);

  if (userPasswords) {
    const entry = userPasswords.entries[id];
    if (entry) {
      entry.link = link;
      entry.username = encryptValue(username);
      entry.password = encryptValue(password);
      res.json({ message: "Passwort aktualisiert", data: passwords });
    } else {
      res.status(404).json({ message: "Eintrag nicht gefunden" });
    }
  } else {
    res
      .status(404)
      .json({ message: "Keine Passwörter für diesen Benutzer gefunden" });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
