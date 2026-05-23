// Current selected contact
let selectedContact = null;

// Login button reference
const loginButton = document.getElementById("loginButton");

// Register button reference
const registerButton = document.getElementById("registerButton");

// Logout button reference
const logoutButton = document.getElementById("logoutButton");

// Add button reference
const addButton = document.getElementById("addButton");

// Update button reference
const updateButton = document.getElementById("updateButton");

// Delete button reference
const deleteButton = document.getElementById("deleteButton");

// Search button reference
const searchButton = document.getElementById("searchButton");

// Login button event
if (loginButton)
{
    loginButton.addEventListener("click", login);
}

// Register button event
if (registerButton)
{
    registerButton.addEventListener("click", register);
}

// Logout button event
if (logoutButton)
{
    logoutButton.addEventListener("click", logout);
}

// Add button event
if (addButton)
{
    addButton.addEventListener("click", addContact);
}

// Update button event
if (updateButton)
{
    updateButton.addEventListener("click", updateContact);
}

// Delete button event
if (deleteButton)
{
    deleteButton.addEventListener("click", deleteContact);
}

// Search button event
if (searchButton)
{
    searchButton.addEventListener("click", searchContacts);
}

// Login function
function login()
{
    // Get username
    const username =
        document.getElementById("loginUsername").value;

    // Get password
    const password =
        document.getElementById("loginPassword").value;

    // Console message
    console.log("Login clicked");

    // Console username
    console.log(username);

    // Console password
    console.log(password);

    // Temporary redirect
    window.location.href = "contacts.html";
}

// Register function
function register()
{
    // Console message
    console.log("Register clicked");

    // Automatically log in user
    window.location.href = "contacts.html";
}

// Logout function
function logout()
{
    // Return to login page
    window.location.href = "index.html";
}

// Add contact function
function addContact()
{
    // Console message
    console.log("Add contact");
}

// Update contact function
function updateContact()
{
    // Console message
    console.log("Update contact");
}

// Delete contact function
function deleteContact()
{
    // Console message
    console.log("Delete contact");
}

// Search contacts function
function searchContacts()
{
    // Console message
    console.log("Search contacts");
}

// Select contact function
function selectContact(
    element,
    firstName,
    lastName,
    email,
    phone)
{
    // Remove old selection
    clearSelectedContacts();

    // Add selected class
    element.classList.add("selected-contact");

    // Store selected contact
    selectedContact =
    {
        firstName,
        lastName,
        email,
        phone
    };

    // Fill edit first name
    document.getElementById("editFirstName").value =
        firstName;

    // Fill edit last name
    document.getElementById("editLastName").value =
        lastName;

    // Fill edit email
    document.getElementById("editEmail").value =
        email;

    // Fill edit phone
    document.getElementById("editPhone").value =
        phone;
}

// Clear selected contacts
function clearSelectedContacts()
{
    // Get all contact cards
    const cards =
        document.querySelectorAll(".contact-card");

    // Loop through cards
    cards.forEach(card =>
    {
        // Remove selected class
        card.classList.remove("selected-contact");
    });
}