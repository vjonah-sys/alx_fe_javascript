// -------------------------
// Step 1: Initial Setup
// -------------------------

// Quotes stored as an array of objects
let quotes = [
  { text: "Push yourself, because no one else is going to do it for you.", category: "Motivation" },
  { text: "Success doesn’t just find you. You have to go out and get it.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity. – Albert Einstein", category: "Wisdom" },
  { text: "The only true wisdom is in knowing you know nothing. – Socrates", category: "Wisdom" },
  { text: "I am on a seafood diet. I see food, and I eat it.", category: "Humor" }
];

// Get references to DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// -------------------------
// Step 2: Advanced DOM Manipulation
// -------------------------

// Function to display a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  quoteDisplay.textContent = `"${randomQuote.text}" — (${randomQuote.category})`;
}

// Function to dynamically create the "Add Quote" form
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <h3>Add a New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  // Append form to body (or a specific container if needed)
  document.body.appendChild(formContainer);

  // Attach event listener to the new button
  const addQuoteBtn = document.getElementById("addQuoteBtn");
  addQuoteBtn.addEventListener("click", addQuote);
}

// -------------------------
// Step 3: Dynamic Quote Addition
// -------------------------

// Function to add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  // Add new quote object to the array
  quotes.push({ text, category });

  // Clear input fields
  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
  showRandomQuote(); // Immediately show a random quote after adding
}

// -------------------------
// Event Listeners & Init
// -------------------------

// Show a new random quote when button is clicked
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize application
showRandomQuote();     // Show a random quote on load
createAddQuoteForm();  // Create the "Add Quote" form dynamically
