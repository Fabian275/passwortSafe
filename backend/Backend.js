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
        pwId: 1,
        link: encryptValue("google.com", "7c6a180b36896a0a8c02787eeafb0e4c"),
        username: encryptValue("user1name", "7c6a180b36896a0a8c02787eeafb0e4c"),
        password: encryptValue("password1", "7c6a180b36896a0a8c02787eeafb0e4c"),
        category: "Websites",
      },
      {
        pwId: 2,
        link: encryptValue("abc.com", "7c6a180b36896a0a8c02787eeafb0e4c"),
        username: encryptValue("user1name", "7c6a180b36896a0a8c02787eeafb0e4c"),
        password: encryptValue("password2", "7c6a180b36896a0a8c02787eeafb0e4c"),
        category: "Bank",
      },
    ],
  },
  {
    userId: 2,
    entries: [
      {
        pwId: 1,
        link: encryptValue("web.com", "6cb75f652a9b52798eb6cf2201057c73"),
        username: encryptValue("user2name", "6cb75f652a9b52798eb6cf2201057c73"),
        password: encryptValue("password3", "6cb75f652a9b52798eb6cf2201057c73"),
        category: "Notizen",
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
  let maxId = Math.max(...users.map((user) => user.id));

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
  const { link, username, password, category } = req.body;
  const { user } = req;

  const key = user.key;
  const encryptedPassword = encryptValue(password, key);
  const encryptedUsername = encryptValue(username, key);
  const encryptedLink = encryptValue(link, key);

  const userPasswords = passwords.find((pw) => pw.userId === req.user.id);
  let newPwId = 1;
  if (userPasswords) {
    if (userPasswords.entries.length > 0) {
      const maxPwId = Math.max(
        ...userPasswords.entries.map((entry) => entry.pwId)
      );
      newPwId = maxPwId + 1;
    }
    userPasswords.entries.push({
      pwId: newPwId,
      link: encryptedLink,
      username: encryptedUsername,
      password: encryptedPassword,
      category: category,
    });
  } else {
    passwords.push({
      userId: req.user.id,
      entries: [
        {
          pwId: newPwId,
          link: encryptedLink,
          username: encryptedUsername,
          password: encryptedPassword,
          category: category,
        },
      ],
    });
  }

  res.json({ message: "Neues Passwort hinzugefügt" });
});

// get password
app.get("/getPasswords", authenticateToken, (req, res) => {
  const { user } = req;
  const {
    sortBy = "link",
    order = "asc",
    filterCategory,
    page = 1,
    pageSize = 10,
  } = req.query;

  const key = user.key;
  try {
    const userPasswords = passwords.find((pw) => pw.userId === req.user.id);
    if (!userPasswords) {
      return res.json([]);
    }

    const decryptedPasswords = userPasswords.entries
      .map((entry) => ({
        pwId: entry.pwId,
        link: decryptValue(entry.link, key),
        username: decryptValue(entry.username, key),
        password: decryptValue(entry.password, key),
        category: entry.category,
      }))
      .filter((entry) => !filterCategory || entry.category === filterCategory);

    decryptedPasswords.sort((a, b) => {
      const fieldA = a[sortBy];
      const fieldB = b[sortBy];

      if (order === "asc") {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const paginatedPasswords = decryptedPasswords.slice(startIndex, endIndex);

    res.json({
      totalItems: decryptedPasswords.length,
      totalPages: Math.ceil(decryptedPasswords.length / pageSize),
      currentPage: parseInt(page),
      passwords: paginatedPasswords,
    });
  } catch (error) {
    res.status(500).json({
      message: "Fehler beim Entschlüsseln der Daten",
      error: error.message,
    });
  }
});

//get one password
app.get("/getOnePassword", authenticateToken, (req, res) => {
  const { user } = req;
  const { pwId } = req.query;

  if (!pwId) {
    return res.status(400).json({ message: "pwId muss angegeben werden." });
  }

  const key = user.key;
  try {
    const userPasswords = passwords.find((pw) => pw.userId === req.user.id);
    if (!userPasswords) {
      return res.status(404).json({ message: "Keine Passwörter gefunden." });
    }

    const entry = userPasswords.entries.find((entry) => entry.pwId === parseInt(pwId));
    if (!entry) {
      return res.status(404).json({ message: "Passwort nicht gefunden." });
    }

    const decryptedPassword = {
      pwId: entry.pwId,
      link: decryptValue(entry.link, key),
      username: decryptValue(entry.username, key),
      password: decryptValue(entry.password, key),
      category: entry.category,
    };

    res.json(decryptedPassword);
  } catch (error) {
    res.status(500).json({
      message: "Fehler beim Entschlüsseln der Daten",
      error: error.message,
    });
  }
});


//update password
app.put("/updatePassword", authenticateToken, (req, res) => {
  const { pwId, link, username, password, category } = req.body;
  const { user } = req;

  const key = user.key;

  if (!link || !username || !password) {
    return res
      .status(400)
      .json({ message: "Alle Felder müssen ausgefüllt werden." });
  }

  const userPasswords = passwords.find((user) => user.userId === req.user.id);
  if (userPasswords) {
    const entry = userPasswords.entries.find(
      (entry) => entry.pwId === parseInt(pwId)
    );

    if (entry) {
      entry.link = encryptValue(link, key);
      entry.username = encryptValue(username, key);
      entry.password = encryptValue(password, key);
      entry.category = category;
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

app.delete("/deletePassword", authenticateToken, (req, res) => {
  const { pwId } = req.body;

  if (!pwId) {
    return res.status(400).json({ message: "pwId muss angegeben werden." });
  }

  const userPasswords = passwords.find((user) => user.userId === req.user.id);

  if (userPasswords) {
    const entryIndex = userPasswords.entries.findIndex(
      (entry) => entry.pwId === parseInt(pwId)
    );
    if (entryIndex !== -1) {
      userPasswords.entries.splice(entryIndex, 1);
      res.json({ message: "Passwort gelöscht", data: passwords });
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
