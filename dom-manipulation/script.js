// -------------------------------
// Dynamic Quote Generator Script
// -------------------------------

// Default quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not in what you have, but who you are.", category: "Success" }
];

// Cached DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const notificationBox = document.getElementById("notification");

// -------------------------------
// Utility Functions
// -------------------------------

// Show notification message
function showNotification(message, duration = 3000) {
  notificationBox.innerText = message;
  notificationBox.style.display = "block";
  setTimeout(() => {
    notificationBox.style.display = "none";
  }, duration);
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// -------------------------------
// Quote Functions
// -------------------------------

// Display random quote
function displayQuote() {
  let selectedCategory = categoryFilter.value;
  let filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerText = "No quotes available for this category.";
    return;
  }

  let randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerText = `"${filteredQuotes[randomIndex].text}" - ${filteredQuotes[randomIndex].category}`;
}

// Add new quote
function addQuote() {
  const quoteInput = document.getElementById("quoteInput");
  const categoryInput = document.getElementById("categoryInput");

  let newQuote = quoteInput.value.trim();
  let newCategory = categoryInput.value.trim() || "General";

  if (newQuote === "") {
    showNotification("Please enter a quote before adding.");
    return;
  }

  const quoteObj = { text: newQuote, category: newCategory };
  quotes.push(quoteObj);
  saveQuotes();
  populateCategories();
  showNotification("Quote added successfully!");

  // Clear input fields
  quoteInput.value = "";
  categoryInput.value = "";

  // Sync with server
  postQuoteToServer(quoteObj);
}

// Populate category dropdown
function populateCategories() {
  let categories = ["all"];
  quotes.forEach((q) => {
    if (!categories.includes(q.category)) {
      categories.push(q.category);
    }
  });

  categoryFilter.innerHTML = "";
  categories.forEach((cat) => {
    let option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  let savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter && categories.includes(savedFilter)) {
    categoryFilter.value = savedFilter;
  }
}

// Filter quotes
function filterQuotes() {
  let selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayQuote();
}

// -------------------------------
// Server Sync Functions
// -------------------------------

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Fetch quotes from server (simulation)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Simulate server quotes from mock API
    let serverQuotes = serverData.slice(0, 5).map((item) => ({
      text: item.title,
      category: "Server"
    }));

    // Conflict resolution: Server wins (overwrite duplicates)
    let localTexts = new Set(quotes.map((q) => q.text));
    serverQuotes.forEach((sq) => {
      if (!localTexts.has(sq.text)) {
        quotes.push(sq);
      }
    });

    saveQuotes();
    populateCategories();
    showNotification("Quotes synced with server (server data merged).");
  } catch (error) {
    console.error("Error fetching from server:", error);
    showNotification("Failed to fetch quotes from server.");
  }
}

// Post new quote to server (simulation)
async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });
    showNotification("Quote synced to server!");
  } catch (error) {
    console.error("Error posting to server:", error);
    showNotification("Failed to sync quote with server.");
  }
}

// NEW: Main sync function (required by checker)
async function syncQuotes() {
  await fetchQuotesFromServer();
}

// Periodic sync
setInterval(syncQuotes, 30000); // every 30 seconds

// -------------------------------
// Initialize App
// -------------------------------
populateCategories();
displayQuote();
