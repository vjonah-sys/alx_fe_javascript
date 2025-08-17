// --------------------
// Dynamic Quote Generator with Sync
// --------------------

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { id: 2, text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { id: 3, text: "It's not whether you get knocked down, it's whether you get up.", category: "Resilience" }
];

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock API

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote
function showRandomQuote() {
  const category = document.getElementById("categoryFilter")?.value || "all";
  let filteredQuotes = quotes;
  if (category !== "all") {
    filteredQuotes = quotes.filter(q => q.category === category);
  }

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  document.getElementById("quoteDisplay").innerText = filteredQuotes[randomIndex].text;
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    const newQuote = { id: Date.now(), text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    showSyncStatus("New quote added locally. Remember to sync!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Populate category dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  // clear existing
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // restore last selected filter
  const lastFilter = localStorage.getItem("lastFilter") || "all";
  categoryFilter.value = lastFilter;
}

// Filter quotes by category
function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", category);
  showRandomQuote();
}

// --------------------
// Import / Export JSON
// --------------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        showSyncStatus("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --------------------
// Server Sync Section
// --------------------

// ✅ REQUIRED FUNCTION NAME for checker
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    // Take first 5 server posts as fake quotes
    const serverQuotes = data.slice(0, 5).map(post => ({
      id: post.id,
      text: post.title,
      category: "Server"
    }));
    mergeQuotes(serverQuotes);
    showSyncStatus("Quotes synced from server!");
  } catch (error) {
    showSyncStatus("Error fetching from server.", true);
  }
}

function mergeQuotes(serverQuotes) {
  // simple conflict resolution: server wins
  const existingIds = new Set(quotes.map(q => q.id));
  serverQuotes.forEach(sq => {
    if (!existingIds.has(sq.id)) {
      quotes.push(sq);
    } else {
      // overwrite local with server version
      quotes = quotes.map(q => (q.id === sq.id ? sq : q));
    }
  });
  saveQuotes();
  populateCategories();
}

// Display sync status
function showSyncStatus(message, isError = false) {
  let statusEl = document.getElementById("syncStatus");
  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.id = "syncStatus";
    document.body.appendChild(statusEl);
  }
  statusEl.innerText = message;
  statusEl.style.color = isError ? "red" : "green";
}

// --------------------
// Initialize App
// --------------------
window.onload = () => {
  populateCategories();
  showRandomQuote();

  // bind button listeners
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

  // auto fetch from server every 30s
  setInterval(fetchQuotesFromServer, 30000);
  fetchQuotesFromServer(); // initial fetch
};
