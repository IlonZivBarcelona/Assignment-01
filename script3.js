let users = [];      // store users 
let showFirstName = true; 

// button click event
document.getElementById("generateBtn").addEventListener("click", function() {
    fetchUsers();
});

// fetch users 
function fetchUsers() {
    const countStr = document.getElementById("userCount").value;
    const count = parseInt(countStr, 10);  // convert string to number
    const errorDiv = document.getElementById("error");
    const table = document.getElementById("userTable");

    errorDiv.textContent = "";
    table.innerHTML = "";

    // check if input is empty or not a number
    if (!countStr || isNaN(count) || (count <= 0 || count > 1000 )) {
        errorDiv.textContent = "Please enter a number between 0 and 1000.";
        return;
    }

    fetch("https://randomuser.me/api/?results=" + count)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(function(data) {
            users = data.results;
            renderTable();
        })
        .catch(function(error) {
            errorDiv.textContent = "Error fetching users: " + error.message;
        });
}

function renderTable() {
    const table = document.getElementById("userTable");
    table.innerHTML = "";
    const headerRow = document.createElement("tr");

    const nameHeader = document.createElement("th");
    const select = document.createElement("select");

    select.add(new Option("First Name", "first"));
    select.add(new Option("Last Name", "last"));

    select.value = showFirstName ? "first" : "last";

    select.onchange = function() {
        showFirstName = select.value === "first";
        renderTable();  // re-render 
    };

    nameHeader.appendChild(select);
    headerRow.appendChild(nameHeader);

    const genderHeader = document.createElement("th");
    genderHeader.textContent = "Gender";
    headerRow.appendChild(genderHeader);

    const emailHeader = document.createElement("th");
    emailHeader.textContent = "Email Address";
    headerRow.appendChild(emailHeader);

    const countryHeader = document.createElement("th");
    countryHeader.textContent = "Country";
    headerRow.appendChild(countryHeader);

    table.appendChild(headerRow);

    // Data rows
    users.forEach(function(user) {
        const row = document.createElement("tr");

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

        table.appendChild(row);
    });
}
