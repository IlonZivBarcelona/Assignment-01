// server.js (ESM) - updated for @faker-js/faker v8+ APIs
import express from "express";
import cors from "cors";
import { faker } from "@faker-js/faker";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// log requests
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// serve static
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));
app.get("/", (req, res) => res.sendFile(path.join(publicDir, "index3.html")));

// in-memory store
let usersStore = [];

// generate user using non-deprecated faker APIs
function generateUser(id) {
  const gender = faker.helpers.arrayElement(["male", "female"]);
  // name -> faker.person
  const personFirst = faker.person.firstName(gender === "male" ? "male" : "female");
  const personLast = faker.person.lastName();
  const title = faker.person.prefix();

  // date of birth -> new signature
  const dobDate = faker.date.past({ years: 60, refDate: new Date("2006-01-01") }).toISOString();

  // address/location -> faker.location
  const streetNumber = faker.number.int({ min: 1, max: 9999 });
  const streetName = faker.location.street();
  const city = faker.location.city();
  const state = faker.location.state();
  const country = faker.location.country();
  const postcode = faker.location.zipCode();

  // email using new internet.email signature
  const email = faker.internet.email({ firstName: personFirst, lastName: personLast }).toLowerCase();

  // picture: avatar (this wasn't flagged as deprecated)
  const avatar = faker.image.avatar();

  return {
    id: String(id),
    name: { title, first: personFirst, last: personLast },
    email,
    location: {
      street: { number: streetNumber, name: streetName },
      city,
      state,
      country,
      postcode,
    },
    picture: { large: avatar },
    phone: faker.phone.number?.() ?? faker.phone.number(), // keep existing if available
    cell: faker.phone.number?.() ?? faker.phone.number(),
    dob: { date: dobDate, age: new Date().getFullYear() - new Date(dobDate).getFullYear() },
    gender,
  };
}

function ensureUsers(n) {
  while (usersStore.length < n) usersStore.push(generateUser(usersStore.length + 1));
}

app.get("/users", (req, res) => {
  try {
    const requested = parseInt(req.query.results, 10) || 10;
    if (isNaN(requested) || requested < 1) {
      return res.status(400).json({ error: "results must be a positive integer" });
    }
    const max = Math.min(requested, 1000);
    ensureUsers(max);
    return res.json({ results: usersStore.slice(0, max) });
  } catch (err) {
    console.error("GET /users error:", err);
    return res.status(500).json({ error: "internal server error" });
  }
});

// small get by id for completeness
app.get("/users/:id", (req, res) => {
  const id = String(req.params.id);
  const user = usersStore.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
