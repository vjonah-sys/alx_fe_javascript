// ==================== QUOTES DATA ====================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { id: 2, text: "Simplicity is the soul of efficiency.", category: "Productivity" },
  { id: 3, text: "Do not wait for leaders; do it alone, person to person.", category: "Motivation" }
];

let lastSelectedCategory = localStorage.getItem("lastCategory") || "all";
const syncStatus = document.getElementById("syncStatus");

// ==================== DOM ELEMENTS ====================
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// ==================== SHOW RANDOM QUOTE ====================
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category}`;
}

// ==================== ADD NEW QUOTE ====================
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuote = {
    id: Date.now(), // unique ID for conflict resolution
    text: textInput.value.trim(),
    category: categoryInput.value.trim()
  };

  if (newQuote.text && newQuote.category) {
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    textInput.value = "";
    categoryInput.value = "";
    alert("New quote added!");
    syncWithServer("local-add", newQuote);
  } else {
    alert("Please enter both quote text and category.");
  }
}

// ==================== POPULATE CATEGORIES ====================
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    if (category === lastSelectedCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

// ==================== FILTER QUOTES ====================
function filterQuotes() {
  lastSelectedCategory = categoryFilter.value;
  localStorage.setItem("lastCategory", lastSelectedCategory);
  showRandomQuote();
}

// ==================== STORAGE ====================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ==================== JSON EXPORT ====================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// ==================== JSON IMPORT ====================
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ==================== SERVER SYNC (SIMULATED) ====================
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Conflict resolution: server takes precedence
function mergeQuotes(serverQuotes) {
  const localQuotesMap = new Map(quotes.map(q => [q.id, q]));
  serverQuotes.forEach(serverQuote => {
    if (!localQuotesMap.has(serverQuote.id)) {
      // New server quote → add it
      quotes.push(serverQuote);
    } else {
      // Conflict: replace local with server
      localQuotesMap.set(serverQuote.id, serverQuote);
    }
  });
  quotes = Array.from(localQuotesMap.values());
  saveQuotes();
  populateCategories();
  showSyncStatus("Quotes synced with server (server precedence).");
}

// Fetch latest server quotes
async function fetchServerQuotes() {
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
  } catch (error) {
    showSyncStatus("Error fetching from server.", true);
  }
}

// Push new local quote to server (simulation)
async function syncWithServer(action, quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    showSyncStatus("Local changes synced with server.");
  } catch (error) {
    showSyncStatus("Failed to sync local changes.", true);
  }
}

// Sync status UI
function showSyncStatus(message, isError = false) {
  syncStatus.textContent = message;
  syncStatus.style.color = isError ? "red" : "green";
  setTimeout(() => (syncStatus.textContent = ""), 4000);
}

// Periodic sync
setInterval(fetchServerQuotes, 30000);

// ==================== INITIALIZATION ====================
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
populateCategories();
filterQuotes();
fetchServerQuotes(); // initial fetch
