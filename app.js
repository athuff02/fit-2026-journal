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
const todayISO = today.toISOString().split("T")[0];

const formatDate = d => d.toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"});

function getTodayTheme() {
  const diff = Math.floor((today - ANCHOR_DATE) / 86400000);
  return THEMES[diff % THEMES.length];
}

/* ================= STREAK ================= */
function calculateStreak(entries) {
  const days = [...new Set(entries.map(e => e.date))].sort().reverse();
  let streak = 0;
  let check = new Date(todayISO);

  for (let d of days) {
    if (d === check.toISOString().split("T")[0]) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else break;
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


/* ================= TABS ================= */
dailyTab.onclick = () => {
  dailyView.classList.remove("hidden");
  historyView.classList.add("hidden");
};

historyTab.onclick = () => {
  historyView.classList.remove("hidden");
  dailyView.classList.add("hidden");
  renderHistory();
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
/* ================= WEEKLY SUMMARY CARD ================= */
function renderWeeklySummary() {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 6);

  const recent = (window.journalEntries || []).filter(e =>
    new Date(e.date) >= weekAgo
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
  div.appendChild(ul);


  historyList.appendChild(div);
}

/* ================= APP START ================= */
let journalEntries = [];

function initializeApp() {
    getDBEntries(entries => {
        journalEntries = entries; // Make entries available globally
        window.journalEntries = entries;
        document.getElementById("streakDisplay").textContent =
            `Current Streak: ${calculateStreak(journalEntries)} day${calculateStreak(journalEntries) === 1 ? "" : "s"}`;
        renderWeeklySummary(); // Now call this
    });
}

// Initialize the app after the DOM is loaded and DB is ready
document.addEventListener('DOMContentLoaded', () => {
    initDB(initializeApp);
});
