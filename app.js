/* ================= CONFIG ================= */
const THEMES = [
  "Health/Fitness","Faith","Discipline/Habits","Romance","Parenting",
  "Career","Finances","Service/Legacy","Developing Intellect & Skills",
  "Friendships/Networking","Hobbies","Reflection/Planning"
];
const SCRIPTURES = {
  "Health/Fitness": "1 Corinthians 6:19–20",
  "Faith": "Hebrews 11:6",
  "Discipline/Habits": "1 Corinthians 9:27",
  "Romance": "Ephesians 5:25",
  "Parenting": "Proverbs 22:6",
  "Career": "Colossians 3:23",
  "Finances": "Proverbs 3:9–10",
  "Service/Legacy": "Matthew 20:26–28",
  "Developing Intellect & Skills": "Proverbs 18:15",
  "Friendships/Networking": "Proverbs 27:17",
  "Hobbies": "Ecclesiastes 3:13",
  "Reflection/Planning": "Psalm 90:12"
};
const STORAGE_KEY = "north_star_entries";
const ANCHOR_DATE = new Date("2026-01-01");

/* ================= DATABASE ================= */
// Using IndexedDB for more robust client-side storage.
// This is a simple wrapper to make it easier to use.
let db;

function initDB(callback) {
  const request = indexedDB.open("Fit2026Journal", 1);

  request.onupgradeneeded = e => {
    db = e.target.result;
    db.createObjectStore("entries", { keyPath: "createdAt" });
  };

  request.onsuccess = e => {
    db = e.target.result;
    if (callback) callback();
  };

  request.onerror = e => {
    console.error("IndexedDB error:", e.target.error);
  };
}

function addEntry(entry, callback) {
  const transaction = db.transaction(["entries"], "readwrite");
  const store = transaction.objectStore("entries");
  const request = store.add(entry);
  request.onsuccess = () => {
    if (callback) callback();
  }
}

function getDBEntries(callback) {
  if (!db) {
    initDB(() => getDBEntries(callback));
    return;
  }
  const transaction = db.transaction(["entries"], "readonly");
  const store = transaction.objectStore("entries");
  const request = store.getAll();

  request.onsuccess = () => {
    // Return in reverse chronological order
    callback(request.result.reverse());
  };
}


/* ================= HELPERS ================= */
// Sanitize user-generated content to prevent XSS attacks.
function sanitize(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

const today = new Date();

function getLocalISOString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const todayISO = getLocalISOString(today);

const formatDate = d => d.toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"});

function getTodayTheme() {
    const anchor = new Date("2026-01-01"); // UTC Midnight
    const current = new Date(todayISO); // UTC Midnight
    const diff = Math.floor((current - anchor) / 86400000);
    // JS % can be negative
    const index = ((diff % THEMES.length) + THEMES.length) % THEMES.length;
    return THEMES[index];
}

/* ================= STREAK ================= */
function calculateStreak(entries) {
  const days = new Set(entries.map(e => e.date));
  let streak = 0;
  let check = new Date(todayISO); // UTC Midnight

  while (true) {
    const checkString = check.toISOString().split("T")[0];
    if (days.has(checkString)) {
      streak++;
      check.setUTCDate(check.getUTCDate() - 1); // Go back 1 day UTC
    } else {
      break;
    }
  }
  return streak;
}

/* ================= INIT ================= */
document.getElementById("dateDisplay").textContent = formatDate(today);
document.getElementById("themeDisplay").textContent = `Today's Focus: ${getTodayTheme()}`;
document.getElementById("scriptureDisplay").textContent =
  `Scripture: ${SCRIPTURES[getTodayTheme()]}`;
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const exportBtn = document.getElementById("exportBtn");
const exportAllBtn = document.getElementById("exportAllBtn");


/* ================= TABS ================= */
dailyTab.onclick = () => {
  dailyView.classList.remove("hidden");
  historyView.classList.add("hidden");
};

historyTab.onclick = () => {
  historyView.classList.remove("hidden");
  dailyView.classList.add("hidden");
  renderHistory();
  renderStats();
};

/* ================= SAVE ================= */
journalForm.onsubmit = e => {
  e.preventDefault();

  const responses = {};
  document.querySelectorAll("[data-question]").forEach(q => responses[q.dataset.question] = q.value);

  const newEntry = {
    date: todayISO,
    theme: getTodayTheme(),
    responses,
    actionItem: actionItem.value,
    createdAt: new Date().toISOString()
  };

  addEntry(newEntry, () => {
    alert("Entry saved.");
    location.reload();
  });
};

/* ================= CALENDAR ================= */
calendarBtn.onclick = () => {
  if (!actionItem.value) return alert("Add an Action Item first.");
  window.open(
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(actionItem.value)}`,
    "_blank"
  );
};

/* ================= HISTORY ================= */
THEMES.forEach(t => {
    const option = document.createElement('option');
    option.textContent = t;
    themeFilter.appendChild(option);
});
themeFilter.onchange = renderHistory;

function renderHistory() {
  historyList.innerHTML = "";
  (window.journalEntries || [])
    .filter(e => themeFilter.value === "all" || e.theme === themeFilter.value)
    .forEach(e => {
      const div = document.createElement("div");
      div.className = "border p-3 rounded bg-white cursor-pointer";

      const p = document.createElement('p');
      p.className = "text-sm font-medium";
      p.textContent = `${e.date} — ${e.theme}`;
      div.appendChild(p);

      div.onclick = () => openModal(e);
      historyList.appendChild(div);
    });
}

/* ================= MODAL ================= */
function openModal(entry) {
  modal.classList.remove("hidden");
  modalContent.innerHTML = ''; // Clear previous content

  // Header
  const header = document.createElement('p');
  header.className = "font-medium";
  header.textContent = `${entry.date} — ${entry.theme}`;
  modalContent.appendChild(header);

  // Scripture
  const scripture = document.createElement('p');
  scripture.className = "text-sm italic text-gray-500";
  scripture.textContent = `Scripture: ${SCRIPTURES[entry.theme]}`;
  modalContent.appendChild(scripture);

  // Responses
  Object.values(entry.responses).forEach((r, i) => {
    const p = document.createElement('p');
    p.className = "text-sm mt-1";
    const strong = document.createElement('strong');
    strong.textContent = `Q${i+1}: `;
    p.appendChild(strong);
    p.append(r); // Using append for text content is safe
    modalContent.appendChild(p);
  });

  // Action Item
  const action = document.createElement('p');
  action.className = "text-sm mt-2";
  const strong = document.createElement('strong');
  strong.textContent = 'Action: ';
  action.appendChild(strong);
  action.append(entry.actionItem);
  modalContent.appendChild(action);


  exportBtn.onclick = () => exportTxt(entry);
}

function closeModal() {
  modal.classList.add("hidden");
}


/* ================= EXPORT ================= */
function exportTxt(entry) {
  const text = `
Date: ${entry.date}
Theme: ${entry.theme}
Scripture: ${SCRIPTURES[entry.theme]}

1. ${entry.responses.q1}
2. ${entry.responses.q2}
3. ${entry.responses.q3}
4. ${entry.responses.q4}
5. ${entry.responses.q5}

Action Item:
${entry.actionItem}
  `.trim();

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `fit-2026_${entry.date}_${entry.theme.replace(/\W+/g,"_").toLowerCase()}.txt`;
  link.click();
}

function escapeCsv(field) {
  if (field === null || field === undefined) {
    return "";
  }
  const stringField = String(field);
  if (stringField.includes(",") || stringField.includes("\n") || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

function exportAllCsv() {
  if (!window.journalEntries || window.journalEntries.length === 0) {
    return alert("No entries to export.");
  }

  const header = ["Date", "Theme", "Question 1", "Question 2", "Question 3", "Question 4", "Question 5", "Action Item", "Created At"];
  const rows = [header.join(",")];

  window.journalEntries.forEach(entry => {
    const row = [
      escapeCsv(entry.date),
      escapeCsv(entry.theme),
      escapeCsv(entry.responses.q1),
      escapeCsv(entry.responses.q2),
      escapeCsv(entry.responses.q3),
      escapeCsv(entry.responses.q4),
      escapeCsv(entry.responses.q5),
      escapeCsv(entry.actionItem),
      escapeCsv(entry.createdAt)
    ];
    rows.push(row.join(","));
  });

  const csvContent = rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  link.download = `fit-2026_full_export_${todayISO}.csv`;
  link.click();
}

exportAllBtn.onclick = exportAllCsv;

/* ================= SUMMARY STATS ================= */
function renderStats() {
  const container = document.getElementById("statsContainer");
  if (!container) return;
  container.innerHTML = "";
  renderWeeklySummary(container);
  renderMonthlySummary(container);
}

function renderWeeklySummary(container) {
  const cutoffDate = new Date(todayISO);
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 6);
  const cutoffString = cutoffDate.toISOString().split("T")[0];

  const recent = (window.journalEntries || []).filter(e =>
    e.date >= cutoffString
  );

  if (!recent.length) return;

  const themes = [...new Set(recent.map(e => e.theme))];
  const actions = recent.map(e => e.actionItem).filter(Boolean);

  const div = document.createElement("div");
  div.className = "border rounded p-3 bg-gray-100";

  // Header
  const header = document.createElement('p');
  header.className = "font-medium text-sm";
  header.textContent = "Weekly Summary";
  div.appendChild(header);

  // Days Completed
  const days = document.createElement('p');
  days.className = "text-sm mt-1";
  days.textContent = `Days Completed: ${recent.length}/7`;
  div.appendChild(days);

  // Themes
  const themesP = document.createElement('p');
  themesP.className = "text-sm mt-1";
  themesP.textContent = `Themes: ${themes.join(", ")}`;
  div.appendChild(themesP);

  // Actions Header
  const actionsHeader = document.createElement('p');
  actionsHeader.className = "text-sm mt-2 font-medium";
  actionsHeader.textContent = "Action Items:";
  div.appendChild(actionsHeader);

  // Actions List
  const ul = document.createElement('ul');
  ul.className = "text-sm list-disc ml-4";
  actions.forEach(a => {
      const li = document.createElement('li');
      li.textContent = a;
      ul.appendChild(li);
  });
  container.appendChild(div);
}

function renderMonthlySummary(container) {
  const entries = window.journalEntries || [];
  if (entries.length === 0) return;

  // Group by Month (YYYY-MM)
  const stats = {};
  entries.forEach(e => {
    // e.date is YYYY-MM-DD
    const monthKey = e.date.substring(0, 7); // YYYY-MM
    if (!stats[monthKey]) {
      stats[monthKey] = new Set();
    }
    stats[monthKey].add(e.date);
  });

  // Convert to array and sort descending
  const sortedMonths = Object.keys(stats).sort().reverse();

  if (sortedMonths.length === 0) return;

  const div = document.createElement("div");
  div.className = "border rounded p-3 bg-white";

  const header = document.createElement('p');
  header.className = "font-medium text-sm mb-2";
  header.textContent = "Monthly Consistency";
  div.appendChild(header);

  const ul = document.createElement('ul');
  ul.className = "space-y-1";

  sortedMonths.forEach(key => {
    // key is YYYY-MM
    const count = stats[key].size;
    const [year, month] = key.split('-');
    // Create date object to get localized month name.
    // Note: using local time might shift dates, but month name should be fine if we set day to 15.
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, 15);
    const monthName = dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const li = document.createElement('li');
    li.className = "text-sm flex justify-between";

    const nameSpan = document.createElement('span');
    nameSpan.textContent = monthName;

    const countSpan = document.createElement('span');
    countSpan.className = "font-medium";
    countSpan.textContent = `${count} day${count === 1 ? '' : 's'}`;

    li.appendChild(nameSpan);
    li.appendChild(countSpan);
    ul.appendChild(li);
  });

  div.appendChild(ul);
  container.appendChild(div);
}

/* ================= APP START ================= */
let journalEntries = [];

function initializeApp() {
    const legacyEntries = localStorage.getItem('north_star_entries');
    if (legacyEntries) {
        try {
            const parsedEntries = JSON.parse(legacyEntries);
            if (Array.isArray(parsedEntries) && parsedEntries.length > 0) {
                const transaction = db.transaction(["entries"], "readwrite");
                const store = transaction.objectStore("entries");
                parsedEntries.forEach(entry => {
                    if (!entry.createdAt) {
                        entry.createdAt = new Date(entry.date).toISOString() + Math.random();
                    }
                    store.add(entry);
                });
                transaction.oncomplete = () => {
                    localStorage.removeItem('north_star_entries');
                    alert('Your journal entries have been upgraded to a new format for better performance. The page will now reload.');
                    location.reload();
                };
                transaction.onerror = (e) => {
                    console.error('Error migrating legacy entries:', e.target.error);
                }
                return;
            }
        } catch (e) {
            console.error('Error parsing or migrating legacy entries:', e);
            localStorage.removeItem('north_star_entries');
        }
    }

    getDBEntries(entries => {
        journalEntries = entries; // Make entries available globally
        window.journalEntries = entries;
        document.getElementById("streakDisplay").textContent =
            `Current Streak: ${calculateStreak(journalEntries)} day${calculateStreak(journalEntries) === 1 ? "" : "s"}`;
        renderStats(); // Now call this
    });
}

// Initialize the app after the DOM is loaded and DB is ready
document.addEventListener('DOMContentLoaded', () => {
    initDB(initializeApp);
});
