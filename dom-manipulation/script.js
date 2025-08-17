// ==================== QUOTES DATA ====================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
  { text: "Do not wait for leaders; do it alone, person to person.", category: "Motivation" }
];

// Restore last selected category from localStorage
let lastSelectedCategory = localStorage.getItem("lastCategory") || "all";

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

// ==================== INITIALIZATION ====================
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
populateCategories();
filterQuotes(); // Apply saved filter immediately
