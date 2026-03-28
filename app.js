/* ================= CONFIG ================= */
const DEFAULT_THEMES = [
  "Health/Fitness","Faith","Discipline/Habits","Romance","Parenting",
  "Career","Finances","Service/Legacy","Developing Intellect & Skills",
  "Friendships/Networking","Hobbies","Reflection/Planning"
];
const DEFAULT_SCRIPTURES = {
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

let THEMES = [...DEFAULT_THEMES];
let SCRIPTURES = { ...DEFAULT_SCRIPTURES };

function loadThemes() {
  const custom = JSON.parse(localStorage.getItem('customThemes') || '[]');
  THEMES = [...DEFAULT_THEMES, ...custom.map(t => t.name)];
  SCRIPTURES = { ...DEFAULT_SCRIPTURES };
  custom.forEach(t => {
    if (t.scripture) SCRIPTURES[t.name] = t.scripture;
  });
}

loadThemes();

const STORAGE_KEY = "north_star_entries";
const DRAFT_KEY = "journal_current_draft";
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

function deleteEntry(createdAt, callback) {
  const transaction = db.transaction(["entries"], "readwrite");
  const store = transaction.objectStore("entries");
  const request = store.delete(createdAt);
  request.onsuccess = () => {
    if (callback) callback();
  };
  request.onerror = (e) => {
    console.error("Error deleting entry:", e);
    announce("Error deleting entry.", { type: 'error' });
  };
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

function announce(message, options = {}) {
  const announcer = document.getElementById("a11y-announcer");
  if (announcer) {
    announcer.textContent = message;
    setTimeout(() => {
      announcer.textContent = "";
    }, 3000);
  }

  if (options.toast !== false) {
    showToast(message, options.type);
  }
}

function showToast(message, type = 'normal') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'error' ? 'bg-red-600' : 'bg-gray-900';
  toast.className = `${bgClass} text-white px-4 py-3 rounded shadow-lg transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-2`;

  const text = document.createElement('span');
  text.textContent = message;
  text.className = "text-sm font-medium";
  toast.appendChild(text);

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
  });

  // Remove after 3s
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-10");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showFeedback(btn, message, type = 'success') {
  if (btn.dataset.feedbackActive) return;
  btn.dataset.feedbackActive = "true";

  const originalText = btn.textContent;
  const originalClasses = btn.className;

  btn.textContent = message;
  announce(message, { toast: false });

  if (type === 'success') {
    btn.classList.remove("border-gray-900", "text-gray-900", "hover:bg-gray-50", "text-gray-700");
    btn.classList.add("border-green-600", "text-green-600", "bg-green-50");
  } else {
    btn.classList.remove("border-gray-900", "text-gray-900", "hover:bg-gray-50", "text-gray-700");
    btn.classList.add("border-red-600", "text-red-600", "bg-red-50");
  }

  setTimeout(() => {
    btn.textContent = originalText;
    btn.className = originalClasses;
    delete btn.dataset.feedbackActive;
  }, 2000);
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

function formatHistoryDate(dateStr) {
  // dateStr is YYYY-MM-DD
  if (dateStr === todayISO) {
    return "Today";
  }

  // Parse YYYY-MM-DD components to avoid timezone issues with Date() constructor
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

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
function initThemeUI() {
  const currentTheme = getTodayTheme();
  document.getElementById("dateDisplay").textContent = formatDate(today);
  document.getElementById("themeDisplay").textContent = `Today's Focus: ${currentTheme}`;
  updateQuestionLabels(currentTheme);

  const scriptureDisplay = document.getElementById("scriptureDisplay");
  if (SCRIPTURES[currentTheme]) {
    scriptureDisplay.textContent = `Scripture: ${SCRIPTURES[currentTheme]}`;
    scriptureDisplay.style.display = "inline-block";
  } else {
    scriptureDisplay.style.display = "none";
  }
}

initThemeUI();

const scriptureDisplay = document.getElementById("scriptureDisplay");
scriptureDisplay.onclick = () => {
  const currentTheme = getTodayTheme();
  if (!SCRIPTURES[currentTheme]) return;
  navigator.clipboard.writeText(scriptureDisplay.textContent)
    .then(() => {
      scriptureDisplay.classList.remove("text-gray-700");
      scriptureDisplay.classList.add("!text-green-600");
      announce("Scripture copied to clipboard");
      setTimeout(() => {
        scriptureDisplay.classList.add("text-gray-700");
        scriptureDisplay.classList.remove("!text-green-600");
      }, 2000);
    })
    .catch(err => {
      console.error("Failed to copy:", err);
      announce("Failed to copy scripture");
    });
};

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const exportBtn = document.getElementById("exportBtn");
const exportAllBtn = document.getElementById("exportAllBtn");
let lastFocusedElement = null;


/* ================= TABS ================= */
function switchTab(tabId, focus = false) {
  const isDaily = tabId === 'dailyTab';

  dailyView.classList.toggle("hidden", !isDaily);
  historyView.classList.toggle("hidden", isDaily);

  const activeClasses = ["border-b-2", "border-gray-900", "text-gray-900"];
  const inactiveClasses = ["text-gray-600"];

  if (isDaily) {
    dailyTab.classList.add(...activeClasses);
    dailyTab.classList.remove(...inactiveClasses);
    historyTab.classList.remove(...activeClasses);
    historyTab.classList.add(...inactiveClasses);
  } else {
    historyTab.classList.add(...activeClasses);
    historyTab.classList.remove(...inactiveClasses);
    dailyTab.classList.remove(...activeClasses);
    dailyTab.classList.add(...inactiveClasses);
    renderHistory();
    renderStats();
  }

  dailyTab.setAttribute("aria-selected", isDaily);
  dailyTab.setAttribute("tabindex", isDaily ? "0" : "-1");
  historyTab.setAttribute("aria-selected", !isDaily);
  historyTab.setAttribute("tabindex", !isDaily ? "0" : "-1");

  if (focus) document.getElementById(tabId).focus();
}

dailyTab.onclick = () => switchTab('dailyTab');
historyTab.onclick = () => switchTab('historyTab');

const tabList = document.querySelector('[role="tablist"]');
if (tabList) {
  tabList.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const targetId = document.activeElement.id === 'dailyTab' ? 'historyTab' : 'dailyTab';
      switchTab(targetId, true);
    }
  });
}

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

  const btn = document.getElementById("saveBtn");
  btn.disabled = true;
  btn.textContent = "Saving...";
  announce("Saving entry...", { toast: false });

  addEntry(newEntry, () => {
    // Check for date change (midnight crossing)
    const currentISO = getLocalISOString(new Date());
    if (currentISO !== todayISO) {
        announce("Entry saved! Refreshing for new day...");
        setTimeout(() => location.reload(), 1000);
        return;
    }

    btn.textContent = "Saved!";
    announce("Entry saved successfully.", { toast: false });
    btn.classList.remove("bg-gray-900", "hover:bg-gray-800", "transition-colors");
    btn.classList.add("bg-green-600", "border-green-600");
    // Clear draft on successful save
    if (typeof DRAFT_KEY !== 'undefined') localStorage.removeItem(DRAFT_KEY);

    // Refresh Data & UI without reload
    getDBEntries(entries => {
        window.journalEntries = entries;
        document.getElementById("streakDisplay").textContent =
            `Current Streak: ${calculateStreak(entries)} day${calculateStreak(entries) === 1 ? "" : "s"}`;
        renderStats();
        renderHistory();

        // Clear Form
        document.querySelectorAll("[data-question]").forEach(q => q.value = "");
        document.getElementById("actionItem").value = "";

        // Reset Textarea Heights
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        });

        // Reset Button State
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = `Save Entry <span class="hidden sm:inline opacity-75 font-normal ml-1" aria-hidden="true">(Ctrl + Enter)</span>`;
            btn.classList.add("bg-gray-900", "hover:bg-gray-800", "transition-colors");
            btn.classList.remove("bg-green-600", "border-green-600");
        }, 2000);
    });
  });
};

journalForm.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    document.getElementById("saveBtn").click();
  }
});

/* ================= CALENDAR ================= */
let calendarErrorTimeout;

function resetCalendarError() {
  if (calendarErrorTimeout) {
    clearTimeout(calendarErrorTimeout);
    calendarErrorTimeout = null;
  }
  calendarBtn.textContent = "Add Action Item to Calendar";
  calendarBtn.classList.remove("bg-red-50", "text-red-600", "border-red-600");
  calendarBtn.classList.add("border-gray-900");
}

calendarBtn.onclick = () => {
  if (!actionItem.value) {
    resetCalendarError(); // Clear any existing timeout first to be safe

    calendarBtn.textContent = "Action Item Required!";
    announce("Action Item Required. Please enter an action item.", { toast: false });
    calendarBtn.classList.remove("border-gray-900");
    calendarBtn.classList.add("bg-red-50", "text-red-600", "border-red-600");

    actionItem.focus();

    calendarErrorTimeout = setTimeout(resetCalendarError, 2000);
    return;
  }
  window.open(
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(actionItem.value)}`,
    "_blank"
  );
};

// Clear error state immediately when user starts typing
actionItem.addEventListener('input', () => {
  if (calendarErrorTimeout) {
    resetCalendarError();
  }
});

/* ================= HISTORY ================= */
function initThemeFilter() {
  const themeFilter = document.getElementById("themeFilter");
  const currentValue = themeFilter.value;
  themeFilter.innerHTML = '<option value="all">All Themes</option>';
  THEMES.forEach(t => {
    const option = document.createElement('option');
    option.textContent = t;
    option.value = t;
    themeFilter.appendChild(option);
  });
  if (THEMES.includes(currentValue)) {
    themeFilter.value = currentValue;
  }
}

initThemeFilter();
themeFilter.onchange = renderHistory;

function renderHistory() {
  historyList.innerHTML = "";
  const entries = window.journalEntries || [];
  const filter = themeFilter.value;

  const filtered = entries.filter(e => filter === "all" || e.theme === filter);

  if (filtered.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "text-center py-8 text-gray-700";

    const p = document.createElement("p");
    p.className = "text-sm";

    if (filter === "all") {
      p.textContent = "No entries yet. Start your journey in the Daily Focus tab!";
      p.className = "text-sm mb-4";
      emptyState.appendChild(p);

      const cta = document.createElement("button");
      cta.textContent = "Write Today's Entry";
      cta.className = "bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2";
      cta.onclick = () => {
          switchTab('dailyTab');
          const firstInput = document.getElementById("q1");
          if (firstInput) firstInput.focus();
      };
      emptyState.appendChild(cta);
    } else {
      p.textContent = `No entries found for "${filter}".`;
      emptyState.appendChild(p);
    }
    historyList.appendChild(emptyState);
    return;
  }

  filtered.forEach(e => {
      const btn = document.createElement("button");
      btn.className = "w-full text-left border p-3 rounded bg-white transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 flex justify-between items-center";

      const textDiv = document.createElement("div");
      textDiv.className = "flex-grow overflow-hidden pr-2";

      const p = document.createElement('p');
      p.className = "text-sm font-medium text-gray-900";
      p.textContent = `${formatHistoryDate(e.date)} — ${e.theme}`;
      textDiv.appendChild(p);

      if (e.actionItem) {
        const action = document.createElement('p');
        action.className = "text-xs text-gray-600 mt-1 truncate";
        action.textContent = `Action: ${e.actionItem}`;
        textDiv.appendChild(action);
      }

      btn.appendChild(textDiv);

      const iconDiv = document.createElement("div");
      iconDiv.className = "text-gray-400 flex-shrink-0";
      iconDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>`;
      btn.appendChild(iconDiv);

      btn.onclick = () => openModal(e);
      historyList.appendChild(btn);
    });
}

/* ================= MODAL ================= */
function trapFocus(e) {
  const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
  if (!isTabPressed) return;

  const focusableElements = modal.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) {
      e.preventDefault();
      return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.shiftKey) { // Shift + Tab
    if (document.activeElement === firstElement || !Array.from(focusableElements).includes(document.activeElement)) {
      lastElement.focus();
      e.preventDefault();
    }
  } else { // Tab
    if (document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  }
}

function openModal(entry) {
  lastFocusedElement = document.activeElement;
  modal.classList.remove("hidden");
  modal.addEventListener('keydown', trapFocus);
  modalContent.innerHTML = ''; // Clear previous content

  // Header
  const header = document.createElement('h2');
  header.className = "font-medium outline-none";
  header.id = "modalTitle";
  header.tabIndex = -1;
  header.textContent = `${entry.date} — ${entry.theme}`;
  modalContent.appendChild(header);

  // Scripture
  const scripture = document.createElement('p');
  scripture.className = "text-sm italic text-gray-700";
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


  exportBtn.onclick = (e) => exportTxt(entry, e.target);

  // Delete Button Logic
  const deleteBtn = document.getElementById("deleteBtn");
  if (deleteBtn) {
    deleteBtn.classList.remove("hidden");
    // Reset state
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "text-red-600 border border-red-600 px-3 py-2 rounded text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 hover:bg-red-50 ml-2";

    let confirmDelete = false;
    deleteBtn.onclick = () => {
      if (!confirmDelete) {
          confirmDelete = true;
          deleteBtn.textContent = "Confirm Delete?";
          deleteBtn.className = "bg-red-600 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 ml-2";
          announce("Press delete again to confirm.", { toast: false });
      } else {
          deleteEntry(entry.createdAt, () => {
              announce("Entry deleted.");
              // Set focus target for closeModal to use (since button is gone)
              lastFocusedElement = document.getElementById('themeFilter');
              closeModal();
              // Refresh list
              getDBEntries(entries => {
                  window.journalEntries = entries;
                  renderHistory();
                  renderStats();
              });
          });
      }
    };
  }

  header.focus();
}

function closeModal() {
  modal.classList.add("hidden");
  modal.removeEventListener('keydown', trapFocus);
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});


/* ================= EXPORT ================= */
function exportTxt(entry, btn) {
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

  if (btn) showFeedback(btn, "Exported!", "success");
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

function exportAllCsv(btn) {
  if (!window.journalEntries || window.journalEntries.length === 0) {
    if (btn) return showFeedback(btn, "No entries!", "error");
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

  if (btn) showFeedback(btn, "Exported!", "success");
}

exportAllBtn.onclick = (e) => exportAllCsv(e.target);

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
  div.className = "border rounded p-3 bg-white";

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

/* ================= UX ENHANCEMENTS ================= */
function updateQuestionLabels(theme) {
  const labels = {
    q1: `1. Why does ${theme} matter?`,
    q2: `2. Where do I want to be regarding ${theme}?`,
    q3: `3. What might I be doing if I cared about ${theme} more?`,
    q4: `4. What is one small improvement I can make regarding ${theme}?`,
    q5: `5. What resistance to ${theme} do I need to overcome?`
  };

  for (const [key, text] of Object.entries(labels)) {
    const label = document.querySelector(`label[for="${key}"]`);
    if (label) {
      label.textContent = text;
    }
  }
}

function setupAutoResize() {
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    // Store initial height as min-height
    textarea.style.minHeight = `${textarea.scrollHeight}px`;
    textarea.style.overflowY = 'hidden';

    const resize = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener('input', resize);

    // Initial resize
    resize();
  });
}

/* ================= DRAFTS ================= */

function saveDraft() {
  const responses = {};
  document.querySelectorAll("#journalForm textarea").forEach(q => responses[q.id] = q.value);
  const draft = {
    responses,
    actionItem: document.getElementById("actionItem").value,
    date: todayISO
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function restoreDraft() {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (!saved) return;

  try {
    const draft = JSON.parse(saved);
    let hasContent = false;

    if (draft.responses) {
      Object.entries(draft.responses).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = val;
            if (val) hasContent = true;
        }
      });
    }
    if (draft.actionItem) {
      document.getElementById("actionItem").value = draft.actionItem;
      hasContent = true;
    }

    if (hasContent) {
        // Trigger resize and other listeners
        document.querySelectorAll('#journalForm textarea').forEach(t => {
             t.dispatchEvent(new Event('input'));
        });

        announce("Restored your unsaved draft");
    }

  } catch (e) {
    console.error("Error restoring draft", e);
  }
}

function setupDrafts() {
    restoreDraft();
    const inputs = document.querySelectorAll("#journalForm textarea, #journalForm input");
    inputs.forEach(el => el.addEventListener("input", saveDraft));
}

/* ================= NOTIFICATIONS ================= */
const settingsModal = document.getElementById("settingsModal");
const enableNotificationsCheckbox = document.getElementById("enableNotifications");
const notificationTimeInput = document.getElementById("notificationTime");
const timeSettingsDiv = document.getElementById("timeSettings");

// Load settings
let notificationsEnabled = localStorage.getItem("notificationsEnabled") === "true";
let notificationTime = localStorage.getItem("notificationTime") || "08:00";
let lastNotificationDate = localStorage.getItem("lastNotificationDate") || "";

function openSettings() {
    settingsModal.classList.remove("hidden");
    enableNotificationsCheckbox.checked = notificationsEnabled;
    notificationTimeInput.value = notificationTime;
    toggleTimeInput(notificationsEnabled);
    renderCustomThemesList();

    // Trap focus in settings modal
    settingsModal.addEventListener('keydown', trapFocusSettings);
    // Focus first element
    enableNotificationsCheckbox.focus();
}

function renderCustomThemesList() {
    const list = document.getElementById('customThemesList');
    if (!list) return;
    list.innerHTML = '';

    const custom = JSON.parse(localStorage.getItem('customThemes') || '[]');
    if (custom.length === 0) {
        list.innerHTML = '<p class="text-xs text-gray-600 italic">No custom themes added.</p>';
        return;
    }

    custom.forEach((t, index) => {
        const item = document.createElement('div');
        item.className = "flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200";

        const info = document.createElement('div');
        info.className = "flex flex-col overflow-hidden";
        const name = document.createElement('span');
        name.className = "text-xs font-medium text-gray-900 truncate";
        name.textContent = t.name;
        info.appendChild(name);

        if (t.scripture) {
            const script = document.createElement('span');
            script.className = "text-[10px] text-gray-700 truncate";
            script.textContent = t.scripture;
            info.appendChild(script);
        }

        item.appendChild(info);

        const removeBtn = document.createElement('button');
        removeBtn.className = "text-red-600 hover:text-red-800 p-1 flex-shrink-0";
        removeBtn.setAttribute('aria-label', `Remove theme ${t.name}`);
        removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>';
        removeBtn.onclick = () => removeCustomTheme(index);
        item.appendChild(removeBtn);

        list.appendChild(item);
    });
}

function addCustomTheme() {
    const nameInput = document.getElementById('newThemeName');
    const scriptureInput = document.getElementById('newThemeScripture');
    const name = nameInput.value.trim();
    const scripture = scriptureInput.value.trim();

    if (!name) {
        announce("Theme name is required", { type: 'error' });
        return;
    }

    if (DEFAULT_THEMES.includes(name)) {
        announce("Theme already exists in defaults", { type: 'error' });
        return;
    }

    const custom = JSON.parse(localStorage.getItem('customThemes') || '[]');
    if (custom.some(t => t.name === name)) {
        announce("Theme already exists", { type: 'error' });
        return;
    }

    custom.push({ name, scripture });
    localStorage.setItem('customThemes', JSON.stringify(custom));

    nameInput.value = '';
    scriptureInput.value = '';

    loadThemes();
    renderCustomThemesList();
    refreshThemeUI();
    announce("Theme added");
}

function removeCustomTheme(index) {
    const custom = JSON.parse(localStorage.getItem('customThemes') || '[]');
    custom.splice(index, 1);
    localStorage.setItem('customThemes', JSON.stringify(custom));

    loadThemes();
    renderCustomThemesList();
    refreshThemeUI();
    announce("Theme removed");
}

function refreshThemeUI() {
    initThemeFilter();
    initThemeUI();
    renderHistory();
}

document.getElementById('addThemeBtn').onclick = addCustomTheme;

/* ================= BACKUP & RESTORE LOGIC ================= */

async function exportBackupJSON(btn) {
  try {
    const entries = await new Promise(resolve => getDBEntries(resolve));
    const customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
    const backupData = {
      entries,
      customThemes,
      timestamp: new Date().toISOString()
    };

    const fileContent = JSON.stringify(backupData, null, 2);
    const blob = new Blob([fileContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vision_2026_backup_${todayISO}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);

    if (btn) showFeedback(btn, "Exported!", "success");
  } catch (err) {
    console.error("Export Error:", err);
    if (btn) showFeedback(btn, "Error!", "error");
    announce("Failed to export backup.", { type: 'error' });
  }
}

function importBackupJSON() {
  document.getElementById('importFileInput').click();
}

async function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const backupData = JSON.parse(e.target.result);
      if (!backupData.entries && !backupData.customThemes) {
        throw new Error("Invalid backup file format.");
      }
      await mergeBackup(backupData);
      announce("Backup restored and merged successfully.");
    } catch (err) {
      console.error("Import Error:", err);
      announce("Failed to import backup. Ensure the file is a valid JSON backup.", { type: 'error' });
    } finally {
      // Reset input so the same file can be selected again
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

document.getElementById('exportJsonBtn').onclick = (e) => exportBackupJSON(e.target);
document.getElementById('importJsonBtn').onclick = importBackupJSON;
document.getElementById('importFileInput').onchange = handleImportFile;

async function mergeBackup(backupData) {
    // Merge custom themes
    if (backupData.customThemes) {
        const localCustom = JSON.parse(localStorage.getItem('customThemes') || '[]');
        const mergedThemes = [...localCustom];
        backupData.customThemes.forEach(remoteTheme => {
            if (!mergedThemes.some(t => t.name === remoteTheme.name)) {
                mergedThemes.push(remoteTheme);
            }
        });
        localStorage.setItem('customThemes', JSON.stringify(mergedThemes));
        loadThemes();
        refreshThemeUI();
    }

    // Merge entries
    if (backupData.entries) {
        const localEntries = await new Promise(resolve => getDBEntries(resolve));
        const localIds = new Set(localEntries.map(e => e.createdAt));

        const transaction = db.transaction(["entries"], "readwrite");
        const store = transaction.objectStore("entries");

        let addedCount = 0;
        backupData.entries.forEach(remoteEntry => {
            if (!localIds.has(remoteEntry.createdAt)) {
                store.add(remoteEntry);
                addedCount++;
            }
        });

        transaction.oncomplete = () => {
            if (addedCount > 0) {
                getDBEntries(entries => {
                    window.journalEntries = entries;
                    document.getElementById("streakDisplay").textContent =
                        `Current Streak: ${calculateStreak(entries)} day${calculateStreak(entries) === 1 ? "" : "s"}`;
                    renderStats();
                    renderHistory();
                });
            }
        };
    }
}


function closeSettings() {
    settingsModal.classList.add("hidden");
    settingsModal.removeEventListener('keydown', trapFocusSettings);
    document.getElementById("settingsBtn").focus();
}

function toggleTimeInput(show) {
    if (show) {
        timeSettingsDiv.classList.remove("hidden");
    } else {
        timeSettingsDiv.classList.add("hidden");
    }
}

// Reuse trap focus logic or create a specific one for settings if elements differ significantly.
// But trapFocus relies on 'modal' variable which points to history modal.
// I should duplicate or generalize trapFocus.
// For now, I'll create a simple one for settings.

function trapFocusSettings(e) {
  const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
  if (!isTabPressed) return;

  const focusableElements = settingsModal.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) {
      e.preventDefault();
      return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.shiftKey) { // Shift + Tab
    if (document.activeElement === firstElement || !Array.from(focusableElements).includes(document.activeElement)) {
      lastElement.focus();
      e.preventDefault();
    }
  } else { // Tab
    if (document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  }
}


document.getElementById("settingsBtn").onclick = openSettings;
document.getElementById("cancelSettingsBtn").onclick = closeSettings;

enableNotificationsCheckbox.onchange = () => {
    toggleTimeInput(enableNotificationsCheckbox.checked);
    if (enableNotificationsCheckbox.checked) {
        if (Notification.permission !== "granted") {
            Notification.requestPermission().then(permission => {
                if (permission !== "granted") {
                    announce("We need permission to show notifications.", { type: 'error' });
                    enableNotificationsCheckbox.checked = false;
                    toggleTimeInput(false);
                }
            });
        }
    }
};

document.getElementById("saveSettingsBtn").onclick = () => {
    notificationsEnabled = enableNotificationsCheckbox.checked;
    notificationTime = notificationTimeInput.value;

    localStorage.setItem("notificationsEnabled", notificationsEnabled);
    localStorage.setItem("notificationTime", notificationTime);

    closeSettings();
    announce("Settings saved.");

    // Ask for permission if they enabled it but didn't trigger change event (e.g. was already enabled visually but permission revoked)
    if (notificationsEnabled && Notification.permission !== "granted") {
         Notification.requestPermission();
    }
};

// Check loop
setInterval(() => {
    if (!notificationsEnabled) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    // Use local date string for "today" to match user's day
    const localTodayStr = getLocalISOString(now);

    if (currentTime === notificationTime && lastNotificationDate !== localTodayStr) {
        try {
            new Notification("Fit 2026 Journal", {
                body: "Time to reflect on your goals!",
                icon: "icon-192.png"
            });

            lastNotificationDate = localTodayStr;
            localStorage.setItem("lastNotificationDate", lastNotificationDate);
        } catch (e) {
            console.error("Notification failed:", e);
        }
    }
}, 30000); // Check every 30 seconds to be safe against drift

// Also close settings on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !settingsModal.classList.contains("hidden")) {
    closeSettings();
  }
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    closeSettings();
  }
});


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
    setupAutoResize();
    setupDrafts();
});
