// API base URL
const API_BASE = "http://dylanwexler.com/LAMPAPI";

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

// Redirect to login if not logged in, then load page
function initContactsPage()
{
    // Redirect to login if no user session exists
    if (!sessionStorage.getItem("userId"))
    {
        window.location.href = "index.html";
        return;
    }

    // Display the logged-in user's name
    displayUsername();

    // Disable edit section until a contact is selected
    setEditEnabled(false);

    // Load this user's contacts from the API
    loadContacts();
}

// ─── USERNAME ─────────────────────────────────────────────────────────────────

// Show the logged-in user's first name in the header
function displayUsername()
{
    if (!welcomeText) return;

    const firstName = sessionStorage.getItem("firstName") || "User";

    welcomeText.textContent = "Hello, " + firstName;
}

// ─── API HELPER ───────────────────────────────────────────────────────────────

// Send a POST request to a PHP endpoint and return the parsed JSON response
function apiPost(endpoint, body)
{
    return fetch(API_BASE + "/" + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(res => res.json());
}

// ─── LOGIN PAGE FUNCTIONS ─────────────────────────────────────────────────────

// Log in an existing user
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

    // POST { login, password } → { id, firstName, lastName, error }
    apiPost("Login.php", { login: username, password: password })
    .then(data =>
    {
        // Show error message if login failed
        if (data.error !== "")
        {
            result.textContent = data.error;
            return;
        }

        // Save user info to session storage
        sessionStorage.setItem("userId",    data.id);
        sessionStorage.setItem("firstName", data.firstName);
        sessionStorage.setItem("lastName",  data.lastName);

        // Go to contacts page
        window.location.href = "contacts.html";
    })
    .catch(() =>
    {
        result.textContent = "Could not connect to server.";
    });
}

// Register a new user
function register()
{
    const firstName = document.getElementById("registerFirstName").value.trim();
    const lastName  = document.getElementById("registerLastName").value.trim();
    const username  = document.getElementById("loginUsername").value.trim();
    const password  = document.getElementById("loginPassword").value.trim();
    const result    = document.getElementById("loginResult");

    if (!firstName || !lastName || !username || !password)
    {
        result.textContent = "Please fill in all fields to register.";
        return;
    }

    // POST { firstName, lastName, login, password } → { error }
    apiPost("Register.php", {
        firstName: firstName,
        lastName:  lastName,
        login:     username,
        password:  password
    })
    .then(data =>
    {
        // Show error if registration failed (e.g. username taken)
        if (data.error !== "")
        {
            result.textContent = data.error;
            return;
        }

        // Registration succeeded — now log the user in automatically
        result.textContent = "";
        return apiPost("Login.php", { login: username, password: password });
    })
    .then(data =>
    {
        // Skip if register already showed an error
        if (!data) return;

        if (data.error !== "")
        {
            result.textContent = data.error;
            return;
        }

        // Save user info and redirect
        sessionStorage.setItem("userId",    data.id);
        sessionStorage.setItem("firstName", data.firstName);
        sessionStorage.setItem("lastName",  data.lastName);

        window.location.href = "contacts.html";
    })
    .catch(() =>
    {
        result.textContent = "Could not connect to server.";
    });
}

// Clear session and return to login page
function logout()
{
    sessionStorage.clear();
    window.location.href = "index.html";
}

// ─── CONTACT LOADING ──────────────────────────────────────────────────────────

// Load all contacts for the logged-in user by searching with an empty string
function loadContacts()
{
    const userId = parseInt(sessionStorage.getItem("userId"));

    // POST { search: "", userId } → { results: [...], error }
    apiPost("SearchContacts.php", { search: "", userId: userId })
    .then(data =>
    {
        if (data.error !== "")
        {
            console.error("Failed to load contacts:", data.error);
            return;
        }

        // API returns capitalized keys (ID, FirstName, etc.) — normalize them
        const contacts = data.results.map(normalizeContact);

        renderContacts(contacts);
    })
    .catch(() =>
    {
        console.error("Could not connect to server.");
    });
}

// ─── NORMALIZE CONTACT ────────────────────────────────────────────────────────

// Convert API's capitalized keys to camelCase for consistent use in JS
// API returns: { ID, FirstName, LastName, Phone, Email }
// We use:      { id, firstName, lastName, phone, email }
function normalizeContact(raw)
{
    return {
        id:        raw.ID,
        firstName: raw.FirstName,
        lastName:  raw.LastName,
        phone:     raw.Phone,
        email:     raw.Email
    };
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

    // Toggle disabled attribute on all inputs and buttons inside edit section
    const inputs  = editSection.querySelectorAll("input");
    const buttons = editSection.querySelectorAll("button");

    inputs.forEach(input   => input.disabled  = !enabled);
    buttons.forEach(button => button.disabled = !enabled);

    // Show or hide the hint text
    if (editHint)
    {
        editHint.style.display = enabled ? "none" : "block";
    }
}

// ─── ADD CONTACT ──────────────────────────────────────────────────────────────

// Add a new contact for the logged-in user
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

    showFormError("addError", "");

    const userId = parseInt(sessionStorage.getItem("userId"));

    // POST { firstName, lastName, phone, email, userId } → { error }
    apiPost("AddContact.php", { firstName, lastName, phone, email, userId })
    .then(data =>
    {
        if (data.error !== "")
        {
            showFormError("addError", data.error);
            return;
        }

        // Clear form fields after successful add
        document.getElementById("addFirstName").value = "";
        document.getElementById("addLastName").value  = "";
        document.getElementById("addEmail").value     = "";
        document.getElementById("addPhone").value     = "";

        // Refresh the contact list
        loadContacts();
    })
    .catch(() =>
    {
        showFormError("addError", "Could not connect to server.");
    });
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

    showFormError("editError", "");

    const userId = parseInt(sessionStorage.getItem("userId"));
    const id     = parseInt(selectedContact.id);

    // POST { id, firstName, lastName, phone, email, userId } → { error }
    apiPost("UpdateContact.php", { id, firstName, lastName, phone, email, userId })
    .then(data =>
    {
        if (data.error !== "")
        {
            showFormError("editError", data.error);
            return;
        }

        // Refresh contacts and deselect after update
        loadContacts();
        setEditEnabled(false);
    })
    .catch(() =>
    {
        showFormError("editError", "Could not connect to server.");
    });
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

    const userId = parseInt(sessionStorage.getItem("userId"));
    const id     = parseInt(selectedContact.id);

    // POST { id, userId } → { error }
    apiPost("DeleteContact.php", { id, userId })
    .then(data =>
    {
        if (data.error !== "")
        {
            showFormError("editError", data.error);
            return;
        }

        // Refresh contacts and disable edit section after deletion
        loadContacts();
        setEditEnabled(false);
    })
    .catch(() =>
    {
        showFormError("editError", "Could not connect to server.");
    });
}

// ─── FORM ERROR HELPER ────────────────────────────────────────────────────────

// Show or clear an inline error message by element ID
function showFormError(elementId, message)
{
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
}

// ─── SEARCH CONTACTS ──────────────────────────────────────────────────────────

// Search contacts with a partial match against name and last name
function searchContacts()
{
    const query  = document.getElementById("searchInput").value.trim();
    const userId = parseInt(sessionStorage.getItem("userId"));

    // POST { search, userId } → { results: [...], error }
    apiPost("SearchContacts.php", { search: query, userId: userId })
    .then(data =>
    {
        if (data.error !== "")
        {
            console.error("Search failed:", data.error);
            return;
        }

        // Normalize capitalized API keys before rendering
        const contacts = data.results.map(normalizeContact);

        renderContacts(contacts);

        // Deselect any contact after a new search
        setEditEnabled(false);
    })
    .catch(() =>
    {
        console.error("Could not connect to server.");
    });
}

// ─── LOGIN PAGE EVENT LISTENERS ───────────────────────────────────────────────
// These only apply on index.html — they're guarded by null checks

const loginButton    = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

if (loginButton)    loginButton.addEventListener("click", login);
if (registerButton) registerButton.addEventListener("click", register);