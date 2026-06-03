// API base URL — set this to your Digital Ocean domain before deploying
const API_BASE = "http://dylanwexler.com/LAMPAPI";

// ─── STATE ────────────────────────────────────────────────────────────────────

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

// Also search when pressing Enter in the search field
const searchInput = document.getElementById("searchInput");
if (searchInput)
{
    searchInput.addEventListener("keydown", e =>
    {
        if (e.key === "Enter") searchContacts();
    });
}

// ─── ON PAGE LOAD ─────────────────────────────────────────────────────────────

if (document.getElementById("contactList"))
{
    initContactsPage();
}

function initContactsPage()
{
    // Redirect to login if no user session exists
    if (!sessionStorage.getItem("userId"))
    {
        window.location.href = "index.html";
        return;
    }

    displayUsername();
    setEditEnabled(false);
    loadContacts();
}

// ─── USERNAME ─────────────────────────────────────────────────────────────────

function displayUsername()
{
    if (!welcomeText) return;
    const firstName = sessionStorage.getItem("firstName") || "there";
    welcomeText.textContent = "Hello, " + firstName;
}

// ─── API HELPER ───────────────────────────────────────────────────────────────

function apiPost(endpoint, body)
{
    return fetch(API_BASE + "/" + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(res => res.json());
}

// ─── LOGIN / REGISTER ─────────────────────────────────────────────────────────

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

    apiPost("Login.php", { login: username, password: password })
    .then(data =>
    {
        if (data.error !== "")
        {
            result.textContent = data.error;
            return;
        }

        sessionStorage.setItem("userId",    data.id);
        sessionStorage.setItem("firstName", data.firstName);
        sessionStorage.setItem("lastName",  data.lastName);

        window.location.href = "contacts.html";
    })
    .catch(() => { result.textContent = "Could not connect to server."; });
}

function register()
{
    const firstName = document.getElementById("registerFirstName").value.trim();
    const lastName  = document.getElementById("registerLastName").value.trim();
    const username  = document.getElementById("registerUsername").value.trim();
    const password  = document.getElementById("registerPassword").value.trim();
    const result    = document.getElementById("loginResult");

    if (!firstName || !lastName || !username || !password)
    {
        result.textContent = "Please fill in all fields to register.";
        return;
    }

    // Register then auto-login
    apiPost("Register.php", { firstName, lastName, login: username, password })
    .then(data =>
    {
        if (data.error !== "")
        {
            result.textContent = data.error;
            return;
        }

        result.textContent = "";
        return apiPost("Login.php", { login: username, password: password });
    })
    .then(data =>
    {
        if (!data) return;

        if (data.error !== "")
        {
            result.textContent = data.error;
            return;
        }

        sessionStorage.setItem("userId",    data.id);
        sessionStorage.setItem("firstName", data.firstName);
        sessionStorage.setItem("lastName",  data.lastName);

        window.location.href = "contacts.html";
    })
    .catch(() => { result.textContent = "Could not connect to server."; });
}

function logout()
{
    sessionStorage.clear();
    window.location.href = "index.html";
}

// ─── CONTACT LOADING ──────────────────────────────────────────────────────────

function loadContacts()
{
    const userId = parseInt(sessionStorage.getItem("userId"));

    apiPost("SearchContacts.php", { search: "", userId: userId })
    .then(data =>
    {
        if (data.error !== "") { console.error("Load failed:", data.error); return; }
        renderContacts(data.results.map(normalizeContact));
    })
    .catch(() => console.error("Could not connect to server."));
}

// ─── NORMALIZE CONTACT ────────────────────────────────────────────────────────

// Convert API's capitalized keys to camelCase
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

function renderContacts(contacts)
{
    const list = document.getElementById("contactList");
    if (!list) return;

    list.innerHTML = "";

    if (contacts.length === 0)
    {
        list.innerHTML = '<p class="no-contacts">No contacts found.</p>';
        return;
    }

    contacts.forEach(contact =>
    {
        const col  = document.createElement("div");
        col.className = "col-lg-4 col-md-6";

        const card = document.createElement("div");
        card.className = "contact-card";

        card.dataset.id        = contact.id;
        card.dataset.firstName = contact.firstName;
        card.dataset.lastName  = contact.lastName;
        card.dataset.email     = contact.email;
        card.dataset.phone     = contact.phone;

        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `${contact.firstName} ${contact.lastName}`);

        card.addEventListener("click", () => selectContact(card));
        card.addEventListener("keydown", e =>
        {
            if (e.key === "Enter" || e.key === " ") selectContact(card);
        });

        // Build initials avatar
        const initials = (contact.firstName[0] || "") + (contact.lastName[0] || "");

        card.innerHTML = `
            <div class="contact-avatar" aria-hidden="true">${initials.toUpperCase()}</div>
            <h3 class="contact-name">${contact.firstName} ${contact.lastName}</h3>
            <p class="contact-info"><i class="bi bi-telephone" aria-hidden="true"></i>${contact.phone}</p>
            <p class="contact-info"><i class="bi bi-envelope" aria-hidden="true"></i>${contact.email}</p>
        `;

        col.appendChild(card);
        list.appendChild(col);
    });
}

// ─── CONTACT SELECTION ────────────────────────────────────────────────────────

function selectContact(card)
{
    clearSelectedContacts();
    card.classList.add("selected-contact");

    selectedContact = {
        id:        card.dataset.id,
        firstName: card.dataset.firstName,
        lastName:  card.dataset.lastName,
        email:     card.dataset.email,
        phone:     card.dataset.phone
    };

    document.getElementById("editFirstName").value = selectedContact.firstName;
    document.getElementById("editLastName").value  = selectedContact.lastName;
    document.getElementById("editEmail").value     = selectedContact.email;
    document.getElementById("editPhone").value     = selectedContact.phone;

    setEditEnabled(true);
}

function clearSelectedContacts()
{
    document.querySelectorAll(".contact-card").forEach(c => c.classList.remove("selected-contact"));
}

function setEditEnabled(enabled)
{
    if (enabled)
        editSection.classList.remove("edit-disabled");
    else
    {
        editSection.classList.add("edit-disabled");
        selectedContact = null;
    }

    editSection.querySelectorAll("input").forEach(i  => i.disabled  = !enabled);
    editSection.querySelectorAll("button").forEach(b => b.disabled = !enabled);

    if (editHint) editHint.style.display = enabled ? "none" : "block";
}

// ─── ADD CONTACT ──────────────────────────────────────────────────────────────

function addContact()
{
    const firstName = document.getElementById("addFirstName").value.trim();
    const lastName  = document.getElementById("addLastName").value.trim();
    const email     = document.getElementById("addEmail").value.trim();
    const phone     = document.getElementById("addPhone").value.trim();

    if (!firstName || !lastName || !email || !phone)
    {
        showFormError("addError", "All fields are required.");
        return;
    }

    showFormError("addError", "");

    const userId = parseInt(sessionStorage.getItem("userId"));

    apiPost("AddContact.php", { firstName, lastName, phone, email, userId })
    .then(data =>
    {
        if (data.error !== "") { showFormError("addError", data.error); return; }

        document.getElementById("addFirstName").value = "";
        document.getElementById("addLastName").value  = "";
        document.getElementById("addEmail").value     = "";
        document.getElementById("addPhone").value     = "";

        loadContacts();
    })
    .catch(() => showFormError("addError", "Could not connect to server."));
}

// ─── UPDATE CONTACT ───────────────────────────────────────────────────────────

function updateContact()
{
    if (!selectedContact) return;

    const firstName = document.getElementById("editFirstName").value.trim();
    const lastName  = document.getElementById("editLastName").value.trim();
    const email     = document.getElementById("editEmail").value.trim();
    const phone     = document.getElementById("editPhone").value.trim();

    if (!firstName || !lastName || !email || !phone)
    {
        showFormError("editError", "All fields are required.");
        return;
    }

    showFormError("editError", "");

    const userId = parseInt(sessionStorage.getItem("userId"));
    const id     = parseInt(selectedContact.id);

    apiPost("UpdateContact.php", { id, firstName, lastName, phone, email, userId })
    .then(data =>
    {
        if (data.error !== "") { showFormError("editError", data.error); return; }

        loadContacts();
        setEditEnabled(false);
    })
    .catch(() => showFormError("editError", "Could not connect to server."));
}

// ─── DELETE CONTACT ───────────────────────────────────────────────────────────

function deleteContact()
{
    if (!selectedContact) return;

    const confirmed = confirm(
        "Delete " + selectedContact.firstName + " " + selectedContact.lastName + "?"
    );

    if (!confirmed) return;

    const userId = parseInt(sessionStorage.getItem("userId"));
    const id     = parseInt(selectedContact.id);

    apiPost("DeleteContact.php", { id, userId })
    .then(data =>
    {
        if (data.error !== "") { showFormError("editError", data.error); return; }

        loadContacts();
        setEditEnabled(false);
    })
    .catch(() => showFormError("editError", "Could not connect to server."));
}

// ─── FORM ERROR HELPER ────────────────────────────────────────────────────────

function showFormError(elementId, message)
{
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
}

// ─── SEARCH CONTACTS ──────────────────────────────────────────────────────────

function searchContacts()
{
    const query  = document.getElementById("searchInput").value.trim();
    const userId = parseInt(sessionStorage.getItem("userId"));

    apiPost("SearchContacts.php", { search: query, userId: userId })
    .then(data =>
    {
        if (data.error !== "") { console.error("Search failed:", data.error); return; }

        renderContacts(data.results.map(normalizeContact));
        setEditEnabled(false);
    })
    .catch(() => console.error("Could not connect to server."));
}

// ─── LOGIN PAGE EVENT LISTENERS ───────────────────────────────────────────────

const loginButton    = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

if (loginButton)    loginButton.addEventListener("click", login);
if (registerButton) registerButton.addEventListener("click", register);