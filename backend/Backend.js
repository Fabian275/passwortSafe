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

// Verschlüsseln
const encryptValue = (value, key) => {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

let passwords = [
  {
    userId: 1,
    entries: [
      {
        link: encryptValue("google.com", "7c6a180b36896a0a8c02787eeafb0e4c"),
        username: encryptValue("user1name", "7c6a180b36896a0a8c02787eeafb0e4c"),
        password: encryptValue("password1", "7c6a180b36896a0a8c02787eeafb0e4c"),
      },
      {
        link: encryptValue("abc.com", "7c6a180b36896a0a8c02787eeafb0e4c"),
        username: encryptValue("user1name", "7c6a180b36896a0a8c02787eeafb0e4c"),
        password: encryptValue("password2", "7c6a180b36896a0a8c02787eeafb0e4c"),
      },
    ],
  },
  {
    userId: 2,
    entries: [
      {
        link: encryptValue("web.com", "6cb75f652a9b52798eb6cf2201057c73"),
        username: encryptValue("user2name", "6cb75f652a9b52798eb6cf2201057c73"),
        password: encryptValue("password3", "6cb75f652a9b52798eb6cf2201057c73"),
      },
    ],
  },
];

const encryptionMasterPassword = (password) => {
  return crypto.createHash("md5").update(password).digest("hex");
};

// Entschlüsseln
const decryptValue = (value, key) => {
  let textParts = value.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  if (iv.length !== IV_LENGTH) {
    throw new Error("Invalid IV length");
  }
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
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
      {
        id: user.id,
        username: user.username,
        key: encryptionMasterPassword(password),
      },
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
  let maxId = Math.max(...users.map(user => user.id));


  if (userExists) {
    res.status(400).json({ message: "Benutzername existiert bereits" });
  } else {
    const newUser = {
      id: maxId + 1,
      username,
      password: hashedPassword,
    };
    users.push(newUser);
    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        key: encryptionMasterPassword(password),
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
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
  const { user } = req;

  const key = user.key;
  const encryptedPassword = encryptValue(password, key);
  const encryptedUsername = encryptValue(username, key);
  const encryptedLink = encryptValue(link, key);

  const userPasswords = passwords.find((pw) => pw.userId === req.user.id);
  if (userPasswords) {
    userPasswords.entries.push({
      link: encryptedLink,
      username: encryptedUsername,
      password: encryptedPassword,
    });
  } else {
    passwords.push({
      userId: req.user.id,
      entries: [
        {
          link: encryptedLink,
          username: encryptedUsername,
          password: encryptedPassword,
        },
      ],
    });
  }

  res.json({ message: "Neues Passwort hinzugefügt" });
});

// get password
app.get("/getPasswords", authenticateToken, (req, res) => {
  const { user } = req;

  const key = user.key;
  try {
    const userPasswords = passwords.find((pw) => pw.userId === req.user.id);
    if (!userPasswords) {
      return res.json([]);
    }
    const decryptedPasswords = userPasswords.entries.map((entry) => ({
      link: decryptValue(entry.link, key),
      username: decryptValue(entry.username, key),
      password: decryptValue(entry.password, key),
    }));

    res.json(decryptedPasswords);
  } catch (error) {
    res.status(500).json({
      message: "Fehler beim Entschlüsseln der Daten",
      error: error.message,
    });
  }
});

//update password
app.put("/updatePassword", authenticateToken, (req, res) => {
  const { id, link, username, password } = req.body;
  const { user } = req;

  const key = user.key;

  if (!link || !username || !password) {
    return res
      .status(400)
      .json({ message: "Alle Felder müssen ausgefüllt werden." });
  }

  const userPasswords = passwords.find((user) => user.userId === req.user.id);

  if (userPasswords) {
    const entry = userPasswords.entries[id];
    if (entry) {
      entry.link = encryptValue(link, key);
      entry.username = encryptValue(username, key);
      entry.password = encryptValue(password, key);
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

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
