// Store quotes in localStorage
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Resilience" }
];

// Display quotes
function displayQuote() {
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  document.getElementById("quoteDisplay").innerText = filteredQuotes[randomIndex].text;
}

// Add new quote
function addQuote() {
  const quoteInput = document.getElementById("quoteInput").value.trim();
  const categoryInput = document.getElementById("categoryInput").value.trim();
  if (quoteInput && categoryInput) {
    const newQuote = { text: quoteInput, category: categoryInput };
    quotes.push(newQuote);
    localStorage.setItem("quotes", JSON.stringify(quotes));
    populateCategories();
    document.getElementById("quoteInput").value = "";
    document.getElementById("categoryInput").value = "";
    displayQuote();
    postQuoteToServer(newQuote);
  }
}

// Populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");

  // Restore last selected filter
  const lastFilter = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = lastFilter;
}

// Filter quotes
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayQuote();
}

// Get filtered quotes
function getFilteredQuotes() {
  const selectedCategory = localStorage.getItem("selectedCategory") || "all";
  if (selectedCategory === "all") return quotes;
  return quotes.filter(q => q.category === selectedCategory);
}

// Simulate server fetch
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
    return serverQuotes;
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }
}

// Post new quote to server
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

// Sync quotes with server
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  if (serverQuotes.length > 0) {
    // Conflict resolution: Server takes precedence
    quotes = [...serverQuotes, ...quotes];
    localStorage.setItem("quotes", JSON.stringify(quotes));
    populateCategories();
    displayQuote();

    // Show both UI notification + alert
    showNotification("Quotes synced with server!");
    alert("Quotes synced with server!");
  }
}

// Show notification in UI
function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.innerText = message;
  notification.style.display = "block";
  setTimeout(() => { notification.style.display = "none"; }, 3000);
}

// Initialize
populateCategories();
displayQuote();

// Auto sync every 30 seconds
setInterval(syncQuotes, 30000);
