let users = [];
let showFirstName = true;
let currentUserIndex = null;
let originalUserSnapshot = null;

const modalEl = document.getElementById("userModal");
const bsModal = () => bootstrap.Modal.getOrCreateInstance(modalEl);

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

document.getElementById("generateBtn").addEventListener("click", fetchUsers);

modalEl.addEventListener("hide.bs.modal", function (e) {
  const editModeEl = document.getElementById("editMode");
  if (!editModeEl) return;

  const inEditMode = editModeEl.style.display !== "none";
  if (!inEditMode) return; 
  if (!originalUserSnapshot || currentUserIndex === null || typeof users[currentUserIndex] === "undefined") {
    return;
  }

  if (isFormDirty()) {
    const wantSave = confirm("You have unsaved changes. Click OK to SAVE changes, Cancel to choose between DISCARD or KEEP editing.");
    if (wantSave) {
      saveUser(false);
      return;
    } else {
      const discard = confirm("Click OK to DISCARD changes and close, Cancel to keep editing.");
      if (discard) {
        users[currentUserIndex] = deepCopy(originalUserSnapshot);
        renderTable();
        return;
      } else {
        e.preventDefault(); // stops modal from closing
        return;
      }
    }
  }
});
modalEl.addEventListener("hidden.bs.modal", function () {
  document.getElementById("editMode").style.display = "none";
  document.getElementById("viewMode").style.display = "block";
  currentUserIndex = null;
  originalUserSnapshot = null;
});
function fetchUsers() {
  const countStr = document.getElementById("userCount").value;
  const count = parseInt(countStr, 10);
  const errorDiv = document.getElementById("error");
  const table = document.getElementById("userTable");

  errorDiv.textContent = "";
  table.innerHTML = "";

  if (!countStr || isNaN(count) || (count <= 0 || count > 1000 )) {
      errorDiv.textContent = "Please enter a number between 0 and 1000.";
      return;
  }

  fetch("https://randomuser.me/api/?results=" + count)
      .then(res => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
      })
      .then(data => {
          users = data.results;
          renderTable();
      })
      .catch(err => errorDiv.textContent = "Error fetching users: " + err.message);
}

// --- Render table ---
function renderTable() {
  const table = document.getElementById("userTable");
  table.innerHTML = "";
  const headerRow = document.createElement("tr");

  const nameHeader = document.createElement("th");
  const select = document.createElement("select");
  select.className = "form-select form-select-sm";
  select.style.width = "auto";
  select.add(new Option("First Name", "first"));
  select.add(new Option("Last Name", "last"));
  select.value = showFirstName ? "first" : "last";
  select.onchange = function() {
      showFirstName = select.value === "first";
      renderTable();
  };
  nameHeader.appendChild(select);
  headerRow.appendChild(nameHeader);

  ["Gender", "Email Address", "Country"].forEach(text => {
      const th = document.createElement("th");
      th.textContent = text;
      headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  users.forEach((user, index) => {
      const row = document.createElement("tr");
      row.style.cursor = "pointer";

      const nameCell = document.createElement("td");
      nameCell.textContent = showFirstName ? user.name.first : user.name.last;
      row.appendChild(nameCell);

      const genderCell = document.createElement("td");
      genderCell.textContent = user.gender;
      row.appendChild(genderCell);

      const emailCell = document.createElement("td");
      emailCell.textContent = user.email;
      row.appendChild(emailCell);

      const countryCell = document.createElement("td");
      countryCell.textContent = user.location.country;
      row.appendChild(countryCell);

      row.ondblclick = () => openUserModal(index);
      table.appendChild(row);
  });
}
function openUserModal(index) {
  if (typeof users[index] === "undefined") return;

  currentUserIndex = index;
  originalUserSnapshot = deepCopy(users[index]); // snapshot

  const user = users[index];
  document.getElementById("modalPicture").src = user.picture.large || "";
  document.getElementById("modalName").textContent = `${user.name.title} ${user.name.first} ${user.name.last}`;
  document.getElementById("modalAddress").textContent = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode || ""}`;
  document.getElementById("modalEmail").textContent = user.email;
  document.getElementById("modalPhone").textContent = `Phone: ${user.phone} • Cell: ${user.cell}`;
  document.getElementById("modalDob").textContent = new Date(user.dob.date).toLocaleDateString();
  document.getElementById("modalGender").textContent = user.gender;
  document.getElementById("viewMode").style.display = "block";
  document.getElementById("editMode").style.display = "none";

  bsModal().show();
}
// Delete user (from view mode) 
document.getElementById("deleteUser").addEventListener("click", () => {
  if (currentUserIndex === null) return;
  const ok = confirm("Are you sure you want to delete this user?");
  if (!ok) return;
  users.splice(currentUserIndex, 1);
  const instance = bsModal();
  originalUserSnapshot = null;
  currentUserIndex = null;
  renderTable();
  instance.hide();
});

// Edit User 
function editUserPromise(user) {
  return new Promise((resolve, reject) => {
    // preload form values
    document.getElementById("editFirst").value = user.name.first || "";
    document.getElementById("editLast").value = user.name.last || "";
    document.getElementById("editGender").value = user.gender || "male";
    document.getElementById("editEmail").value = user.email || "";
    document.getElementById("editAddress").value = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}` || "";
    document.getElementById("editCountry").value = user.location.country || "";

// show edit mode
    document.getElementById("viewMode").style.display = "none";
    document.getElementById("editMode").style.display = "block";

// save handler
    function handleSave(e) {
      e.preventDefault();
      user.name.first = document.getElementById("editFirst").value.trim();
      user.name.last = document.getElementById("editLast").value.trim();
      user.gender = document.getElementById("editGender").value;
      user.email = document.getElementById("editEmail").value.trim();
      user.location.street.name = document.getElementById("editAddress").value.trim();
      user.location.country = document.getElementById("editCountry").value.trim();

      cleanup();
      resolve(user);
    }

// cancel handler
    function handleCancel() {
      cleanup();
      reject("cancel");
    }

// modal closed without saving
    function handleClose() {
      cleanup();
      reject("close");
    }

    function cleanup() {
      document.getElementById("editForm").removeEventListener("submit", handleSave);
      document.getElementById("cancelEdit").removeEventListener("click", handleCancel);
      modalEl.removeEventListener("hidden.bs.modal", handleClose);

      // restore UI state
      document.getElementById("editMode").style.display = "none";
      document.getElementById("viewMode").style.display = "block";
    }

    // attach listeners
    document.getElementById("editForm").addEventListener("submit", handleSave);
    document.getElementById("cancelEdit").addEventListener("click", handleCancel);
    modalEl.addEventListener("hidden.bs.modal", handleClose);
  });
}

// --- Hook up Edit button ---
document.getElementById("editUser").addEventListener("click", async () => {
  if (currentUserIndex === null) return;
  const user = users[currentUserIndex];
  try {
    await editUserPromise(user);
    renderTable();
    openUserModal(currentUserIndex); // reopen in view mode with updated data
  } catch (err) {
    console.log("Edit dismissed:", err); // either "cancel" or "close"
  }
});