// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// Temporary contact list — replace this fetch with a real API call later.
// When the API is ready, delete this array and call loadContacts() which
// already points to the right endpoint (just uncomment the fetch lines).

const MOCK_CONTACTS = [
    {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "1234567890"
    },
    {
        id: 2,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        phone: "9876543210"
    }
];

// API base URL — change this to your Digital Ocean domain when deployed
const API_BASE = "https://yourdomain.com/api";

// ─── STATE ────────────────────────────────────────────────────────────────────

// Currently selected contact object (null if none selected)
let selectedContact = null;

// ─── DOM REFERENCES ───────────────────────────────────────────────────────────

const logoutButton  = document.getElementById("logoutButton");
const addButton     = document.getElementById("addButton");
const updateButton  = document.getElementById("updateButton");
const deleteButton  = document.getElementById("deleteButton");
const searchButton  = document.getElementById("searchButton");
const welcomeText   = document.getElementById("welcomeText");
const editSection   = document.getElementById("editSection");
const editHint      = document.getElementById("editHint");

// ─── EVENT LISTENERS ──────────────────────────────────────────────────────────

if (logoutButton)  logoutButton.addEventListener("click", logout);
if (addButton)     addButton.addEventListener("click", addContact);
if (updateButton)  updateButton.addEventListener("click", updateContact);
if (deleteButton)  deleteButton.addEventListener("click", deleteContact);
if (searchButton)  searchButton.addEventListener("click", searchContacts);

// ─── ON PAGE LOAD ─────────────────────────────────────────────────────────────

// Run setup when contacts page loads
if (document.getElementById("contactList"))
{
    initContactsPage();
}

// Set up the contacts page
function initContactsPage()
{
    // Display the logged-in username
    displayUsername();

    // Disable edit section until a contact is selected
    setEditEnabled(false);

    // Load contacts from mock data (swap for API later)
    loadContacts();
}

// ─── USERNAME ─────────────────────────────────────────────────────────────────

// Show the logged-in username in the header
// TODO: replace sessionStorage.getItem("username") with whatever the API returns
function displayUsername()
{
    if (!welcomeText) return;

    // Try to read the username saved during login
    const username = sessionStorage.getItem("username") || "User";

    welcomeText.textContent = "Hello, " + username;
}

// ─── LOGIN PAGE FUNCTIONS ─────────────────────────────────────────────────────

// Login button — called from index.html context
function login()
{
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const result   = document.getElementById("loginResult");

    if (!username || !password)
    {
        result.textContent = "Please enter a username and password.";
        return;
    }

    // TODO: replace this block with a real fetch() to POST /api/login
    // Expected request body: { login: username, password: password }
    // Expected response:     { id: ..., firstName: ..., lastName: ... }
    // On success: save username to sessionStorage and redirect

    console.log("Login:", username);

    // Save username so contacts page can display it
    sessionStorage.setItem("username", username);

    // Redirect to contacts page
    window.location.href = "contacts.html";
}

// Register button — called from index.html context
function register()
{
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const result   = document.getElementById("loginResult");

    if (!username || !password)
    {
        result.textContent = "Please enter a username and password.";
        return;
    }

    // TODO: replace this block with a real fetch() to POST /api/register
    // Expected request body: { login: username, password: password }
    // On success: redirect to contacts page or auto-login

    console.log("Register:", username);

    sessionStorage.setItem("username", username);
    window.location.href = "contacts.html";
}

// Logout — clears session and returns to login
function logout()
{
    sessionStorage.clear();
    window.location.href = "index.html";
}

// ─── CONTACT LOADING ──────────────────────────────────────────────────────────

// Load and render all contacts
// When the API is ready, replace MOCK_CONTACTS with a real fetch() call
function loadContacts()
{
    // ── MOCK VERSION (remove this block when API is ready) ──
    renderContacts(MOCK_CONTACTS);

    // ── API VERSION (uncomment when API is ready) ──
    // fetch(API_BASE + "/contacts", {
    //     method: "GET",
    //     headers: { "Content-Type": "application/json" }
    // })
    // .then(res => res.json())
    // .then(data => renderContacts(data))
    // .catch(err => console.error("Failed to load contacts:", err));
}

// ─── RENDER CONTACTS ──────────────────────────────────────────────────────────

// Build and inject contact cards from an array of contact objects
function renderContacts(contacts)
{
    const list = document.getElementById("contactList");
    if (!list) return;

    // Clear existing cards
    list.innerHTML = "";

    // Show a message if no contacts found
    if (contacts.length === 0)
    {
        list.innerHTML = '<p class="text-white">No contacts found.</p>';
        return;
    }

    // Create a card for each contact
    contacts.forEach(contact =>
    {
        // Outer column div
        const col = document.createElement("div");
        col.className = "col-lg-4";

        // Card div
        const card = document.createElement("div");
        card.className = "contact-card";

        // Store contact data on the element for easy access
        card.dataset.id        = contact.id;
        card.dataset.firstName = contact.firstName;
        card.dataset.lastName  = contact.lastName;
        card.dataset.email     = contact.email;
        card.dataset.phone     = contact.phone;

        // Click to select this contact
        card.addEventListener("click", () => selectContact(card));

        // Card inner HTML
        card.innerHTML = `
            <h3 class="contact-name">${contact.firstName} ${contact.lastName}</h3>
            <p class="contact-info">${contact.phone}</p>
            <p class="contact-info">${contact.email}</p>
        `;

        col.appendChild(card);
        list.appendChild(col);
    });
}

// ─── CONTACT SELECTION ────────────────────────────────────────────────────────

// Select a contact card and populate the edit form
function selectContact(card)
{
    // Deselect previous card
    clearSelectedContacts();

    // Highlight this card
    card.classList.add("selected-contact");

    // Save selected contact data from the card's dataset
    selectedContact = {
        id:        card.dataset.id,
        firstName: card.dataset.firstName,
        lastName:  card.dataset.lastName,
        email:     card.dataset.email,
        phone:     card.dataset.phone
    };

    // Fill edit fields with selected contact's data
    document.getElementById("editFirstName").value = selectedContact.firstName;
    document.getElementById("editLastName").value  = selectedContact.lastName;
    document.getElementById("editEmail").value     = selectedContact.email;
    document.getElementById("editPhone").value     = selectedContact.phone;

    // Enable the edit section now that a contact is selected
    setEditEnabled(true);
}

// Remove selected styling from all contact cards
function clearSelectedContacts()
{
    document.querySelectorAll(".contact-card").forEach(card =>
    {
        card.classList.remove("selected-contact");
    });
}

// Enable or disable the entire edit section
function setEditEnabled(enabled)
{
    // Toggle greyed-out class on the section wrapper
    if (enabled)
    {
        editSection.classList.remove("edit-disabled");
    }
    else
    {
        editSection.classList.add("edit-disabled");
        selectedContact = null;
    }

    // Toggle disabled on inputs and buttons
    const inputs  = editSection.querySelectorAll("input");
    const buttons = editSection.querySelectorAll("button");

    inputs.forEach(input   => input.disabled   = !enabled);
    buttons.forEach(button => button.disabled  = !enabled);

    // Show or hide the hint text
    if (editHint)
    {
        editHint.style.display = enabled ? "none" : "block";
    }
}

// ─── ADD CONTACT ──────────────────────────────────────────────────────────────

// Add a new contact
function addContact()
{
    const firstName = document.getElementById("addFirstName").value.trim();
    const lastName  = document.getElementById("addLastName").value.trim();
    const email     = document.getElementById("addEmail").value.trim();
    const phone     = document.getElementById("addPhone").value.trim();

    // Show inline error and stop if any field is empty
    if (!firstName || !lastName || !email || !phone)
    {
        showFormError("addError", "All fields are required.");
        return;
    }

    // Clear any previous error on success
    showFormError("addError", "");

    // TODO: replace with fetch() POST to API_BASE + "/contacts"
    // Request body: { firstName, lastName, email, phone }
    // On success: call loadContacts() to refresh the list

    console.log("Add contact:", { firstName, lastName, email, phone });

    // Clear add form after submission
    document.getElementById("addFirstName").value = "";
    document.getElementById("addLastName").value  = "";
    document.getElementById("addEmail").value     = "";
    document.getElementById("addPhone").value     = "";
}

// ─── UPDATE CONTACT ───────────────────────────────────────────────────────────

// Update the selected contact
function updateContact()
{
    if (!selectedContact) return;

    const firstName = document.getElementById("editFirstName").value.trim();
    const lastName  = document.getElementById("editLastName").value.trim();
    const email     = document.getElementById("editEmail").value.trim();
    const phone     = document.getElementById("editPhone").value.trim();

    // Show inline error and stop if any field is empty
    if (!firstName || !lastName || !email || !phone)
    {
        showFormError("editError", "All fields are required.");
        return;
    }

    // Clear any previous error on success
    showFormError("editError", "");

    // TODO: replace with fetch() PUT to API_BASE + "/contacts/" + selectedContact.id
    // Request body: { firstName, lastName, email, phone }
    // On success: call loadContacts() to refresh the list

    console.log("Update contact:", selectedContact.id, { firstName, lastName, email, phone });
}

// ─── DELETE CONTACT ───────────────────────────────────────────────────────────

// Delete the selected contact
function deleteContact()
{
    if (!selectedContact) return;

    // Confirm before deleting
    const confirmed = confirm(
        "Delete " + selectedContact.firstName + " " + selectedContact.lastName + "?"
    );

    if (!confirmed) return;

    // TODO: replace with fetch() DELETE to API_BASE + "/contacts/" + selectedContact.id
    // On success: call loadContacts() to refresh the list, then setEditEnabled(false)

    console.log("Delete contact:", selectedContact.id);

    // Disable edit section after deletion
    setEditEnabled(false);
}

// ─── FORM ERROR HELPER ────────────────────────────────────────────────────────

// Show or clear an inline error message by element ID
function showFormError(elementId, message)
{
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
}

// ─── SEARCH CONTACTS ───────────────────────────────────────────────────────────

// Search contacts by name (partial match required by the rubric)
function searchContacts()
{
    const query = document.getElementById("searchInput").value.trim();

    // TODO: replace with fetch() GET to API_BASE + "/contacts/search?q=" + query
    // The API must support partial matching (required by rubric)
    // On success: call renderContacts(data) with the returned array

    // ── MOCK VERSION: client-side filter (remove when API is ready) ──
    const results = MOCK_CONTACTS.filter(contact =>
    {
        const fullName = (contact.firstName + " " + contact.lastName).toLowerCase();
        return fullName.includes(query.toLowerCase());
    });

    renderContacts(results);

    // Deselect any contact after a new search
    setEditEnabled(false);
}

// ─── LOGIN PAGE EVENT LISTENERS ───────────────────────────────────────────────
// These only apply on index.html — they're guarded by null checks

const loginButton    = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

if (loginButton)    loginButton.addEventListener("click", login);
if (registerButton) registerButton.addEventListener("click", register);