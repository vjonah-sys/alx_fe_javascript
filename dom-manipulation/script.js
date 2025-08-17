"use strict";

/* -----------------------------
   Web Storage Keys
------------------------------ */
const LOCAL_KEY = "dqg_quotes";
const SESSION_KEY = "dqg_lastQuote";

/* -----------------------------
   Default Seed Data
------------------------------ */
const seedQuotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
  { text: "Simplicity is the soul of efficiency.", category: "productivity" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "programming" },
  { text: "In the middle of difficulty lies opportunity.", category: "inspiration" },
  { text: "Premature optimization is the root of all evil.", category: "programming" }
];

/* -----------------------------
   Quotes State
------------------------------ */
let quotes = loadQuotes() ?? seedQuotes.slice();

/* -----------------------------
   DOM References
------------------------------ */
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

let categorySelect;
let addFormContainer;

/* -----------------------------
   Storage Helpers
------------------------------ */
function saveQuotes() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const data = localStorage.getItem(LOCAL_KEY);
  return data ? JSON.parse(data) : null;
}

function saveLastQuote(quote) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(quote));
}

function loadLastQuote() {
  const data = sessionStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

/* -----------------------------
   Utilities
------------------------------ */
function uniqueCategories(list) {
  return Array.from(new Set(list.map(q => q.category))).sort();
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* -----------------------------
   Core Functions
------------------------------ */
function showRandomQuote() {
  const category = categorySelect.value;
  const pool = category === "all" ? quotes : quotes.filter(q => q.category === category);

  if (!pool.length) {
    quoteDisplay.innerHTML = `<div class="muted">No quotes available in this category.</div>`;
    return;
  }

  const q = pickRandom(pool);
  renderQuote(q);
  saveLastQuote(q);
}

function renderQuote(q) {
  quoteDisplay.innerHTML = `
    <div style="margin-bottom:.25rem;">“${q.text}”</div>
    <div class="muted">Category: <span class="chip">${q.category}</span></div>
  `;
}

function addQuote(text, category) {
  if (!text || !category) return;
  quotes.push({ text, category });
  saveQuotes();
  refreshCategorySelect();
  showRandomQuote();
}

/* -----------------------------
   Add Quote Form
------------------------------ */
function createAddQuoteForm() {
  addFormContainer.innerHTML = "";

  const form = document.createElement("form");

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.required = true;

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.required = true;

  const addBtn = document.createElement("button");
  addBtn.type = "submit";
  addBtn.textContent = "Add Quote";

  form.append(quoteInput, categoryInput, addBtn);
  addFormContainer.appendChild(form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addQuote(quoteInput.value.trim(), categoryInput.value.trim());
    form.reset();
  });
}

/* -----------------------------
   Category Select
------------------------------ */
function refreshCategorySelect() {
  categorySelect.innerHTML = "";

  const optAll = document.createElement("option");
  optAll.value = "all";
  optAll.textContent = "All categories";
  categorySelect.appendChild(optAll);

  uniqueCategories(quotes).forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

/* -----------------------------
   Import / Export JSON
------------------------------ */
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        refreshCategorySelect();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error parsing JSON file.");
    }
  };
  reader.readAsText(file);
}

/* -----------------------------
   Init
------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  // Category selector
  const row = document.createElement("div");
  row.className = "row";
  const label = document.createElement("label");
  label.textContent = "Filter:";
  categorySelect = document.createElement("select");
  row.append(label, categorySelect);
  document.body.insertBefore(row, quoteDisplay);
  refreshCategorySelect();

  // Add form toggle
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "Add a Quote";
  document.body.appendChild(toggleBtn);

  addFormContainer = document.createElement("div");
  document.body.appendChild(addFormContainer);

  let formVisible = false;
  toggleBtn.addEventListener("click", () => {
    if (!formVisible) {
      createAddQuoteForm();
      addFormContainer.style.display = "block";
      toggleBtn.textContent = "Hide Form";
    } else {
      addFormContainer.style.display = "none";
      toggleBtn.textContent = "Add a Quote";
    }
    formVisible = !formVisible;
  });

  // Events
  newQuoteBtn.addEventListener("click", showRandomQuote);
  categorySelect.addEventListener("change", showRandomQuote);
  exportBtn.addEventListener("click", exportQuotes);
  importFile.addEventListener("change", importFromJsonFile);

  // Initial render
  const lastQuote = loadLastQuote();
  if (lastQuote) {
    renderQuote(lastQuote);
  } else {
    showRandomQuote();
  }
});
