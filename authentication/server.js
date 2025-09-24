import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Simple in-memory store for demo only
const users = {}; 

app.post("/signup", (req, res) => {
  const { firstName, lastName, email, birthdate, password, repassword } =
    req.body || {};
  if (
    !firstName ||
    !lastName ||
    !email ||
    !birthdate ||
    !password ||
    !repassword
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (password !== repassword)
    return res.status(400).json({ error: "Passwords do not match." });
  const key = email.toLowerCase();
  if (users[key])
    return res.status(400).json({ error: "User already exists." });
  users[key] = { firstName, lastName, email: key, birthdate, password };
  return res.json({ message: "Signup successful." });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });
  const user = users[email.toLowerCase()];
  if (!user || user.password !== password)
    return res.status(400).json({ error: "Invalid credentials." });
  return res.json({
    message: "Login ok",
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      birthdate: user.birthdate,
    },
  });
});

// debug
app.get("/users", (req, res) => res.json(users));

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
