const showSignupBtn = document.getElementById("showSignup");
const showLoginBtn = document.getElementById("showLogin");
const signupView = document.getElementById("signupView");
const loginView = document.getElementById("loginView");
const welcomeView = document.getElementById("welcomeView");
const messageEl = document.getElementById("message");

function showView(view) {
  [signupView, loginView, welcomeView].forEach(
    (v) => (v.style.display = "none")
  );
  messageEl.textContent = "";
  messageEl.className = "";
  if (view === "signup") signupView.style.display = "";
  if (view === "login") loginView.style.display = "";
  if (view === "welcome") welcomeView.style.display = "";
}

showSignupBtn.addEventListener("click", () => showView("signup"));
showLoginBtn.addEventListener("click", () => showView("login"));

async function postJson(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw body;
  return body;
}

// Signup
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageEl.textContent = "";
  const data = Object.fromEntries(new FormData(signupForm).entries());

  try {
    const result = await postJson("/signup", data);
    messageEl.textContent = result.message || "Signed up";
    messageEl.className = "text-success";
    setTimeout(() => showView("login"), 700);
  } catch (err) {
    messageEl.textContent = err.error || "Signup failed";
    messageEl.className = "text-danger";
    console.error(err);
  }
});

// Login
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageEl.textContent = "";
  const data = Object.fromEntries(new FormData(loginForm).entries());
  try {
    const result = await postJson("/login", data);
    document.getElementById(
      "welcomeText"
    ).textContent = `Welcome, ${result.user.firstName} ${result.user.lastName}`;
    document.getElementById(
      "welcomeDetails"
    ).textContent = `Email: ${result.user.email} — Birthdate: ${result.user.birthdate}`;
    showView("welcome");
  } catch (err) {
    messageEl.textContent = err.error || "Login failed";
    messageEl.className = "text-danger";
  }
});

// Logout
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  showView("login");
});

// Start view
showView("signup");