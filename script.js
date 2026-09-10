
(function () {
  "use strict";

  /* ---------------- STORAGE KEYS ---------------- */
  const STORAGE_KEYS = {
    tasks: "studyflow_tasks",
    theme: "studyflow_theme",
    grades: "studyflow_grades",
    pomodoro: "studyflow_pomodoro_settings"
  };

  /* ---------------- MOTIVATIONAL QUOTES ---------------- */
  const QUOTES = [
    "Small progress is still progress.",
    "Discipline is choosing between what you want now and what you want most.",
    "One task at a time builds an entire semester.",
    "Focus on being productive instead of busy.",
    "Consistency beats intensity in the long run.",
    "Your future self is built by today's small habits.",
    "Done is better than perfect — start anyway.",
    "Every study session compounds into real progress.",
    "Break it down. Show up. Repeat.",
    "You don't need more time, you need more focus."
  ];

  /* ---------------- STATE ---------------- */
  let tasks = loadFromStorage(STORAGE_KEYS.tasks, []);
  let grades = loadFromStorage(STORAGE_KEYS.grades, []);
  let currentFilter = "all";
  let currentSubjectFilter = "all";
  let currentSearch = "";

  let pomodoroSettings = loadFromStorage(STORAGE_KEYS.pomodoro, {
    studyMinutes: 25,
    breakMinutes: 5
  });

  let pomodoro = {
    mode: "study", // "study" | "break"
    remainingSeconds: pomodoroSettings.studyMinutes * 60,
    totalSeconds: pomodoroSettings.studyMinutes * 60,
    intervalId: null,
    running: false
  };

  /* ---------------- STORAGE HELPERS ---------------- */
  function loadFromStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.error("Could not read from storage:", key, err);
      return fallback;
    }
  }

  function saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Could not save to storage:", key, err);
    }
  }

  function saveTasks() { saveToStorage(STORAGE_KEYS.tasks, tasks); }
  function saveGrades() { saveToStorage(STORAGE_KEYS.grades, grades); }
  function savePomodoroSettings() { saveToStorage(STORAGE_KEYS.pomodoro, pomodoroSettings); }

  function generateId() {
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  /* ---------------- DOM REFERENCES ---------------- */
  const el = (id) => document.getElementById(id);

  const themeToggle = el("themeToggle");
  const navToggle = el("navToggle");
  const mobileNav = el("mobileNav");

  const greetingText = el("greetingText");
  const currentDateEl = el("currentDate");
  const quoteTextEl = el("quoteText");

  const statPending = el("statPending");
  const statCompleted = el("statCompleted");
  const statUpcoming = el("statUpcoming");
  const statProgress = el("statProgress");
  const todayTaskList = el("todayTaskList");

  const quickTimerDisplay = el("quickTimerDisplay");
  const quickTimerMode = el("quickTimerMode");
  const quickStartBtn = el("quickStartBtn");

  const taskForm = el("taskForm");
  const taskFormTitle = el("taskFormTitle");
  const taskIdInput = el("taskId");
  const taskTitleInput = el("taskTitle");
  const taskDetailsInput = el("taskDetails");
  const taskSubjectInput = el("taskSubject");
  const taskPriorityInput = el("taskPriority");
  const taskDueDateInput = el("taskDueDate");
  const taskSubmitBtn = el("taskSubmitBtn");
  const taskCancelEdit = el("taskCancelEdit");
  const taskTitleError = el("taskTitleError");
  const taskDueDateError = el("taskDueDateError");

  const taskSearchInput = el("taskSearch");
  const filterChips = document.querySelectorAll(".filter-chip");
  const subjectFilterSelect = el("subjectFilter");
  const taskListEl = el("taskList");

  const calendarGrid = el("calendarGrid");

  const timerDisplay = el("timerDisplay");
  const timerRing = el("timerRing");
  const pomodoroModeLabel = el("pomodoroModeLabel");
  const pomodoroStatus = el("pomodoroStatus");
  const startBtn = el("startBtn");
  const pauseBtn = el("pauseBtn");
  const resetBtn = el("resetBtn");
  const studyLengthInput = el("studyLength");
  const breakLengthInput = el("breakLength");
  const applySettingsBtn = el("applySettingsBtn");

  const gradeForm = el("gradeForm");
  const gradeSubjectInput = el("gradeSubject");
  const obtainedMarksInput = el("obtainedMarks");
  const totalMarksInput = el("totalMarks");
  const gradeError = el("gradeError");
  const gradeTableBody = el("gradeTableBody");
  const overallPercentageEl = el("overallPercentage");

  const overallProgressFill = el("overallProgressFill");
  const overallProgressLabel = el("overallProgressLabel");
  const subjectProgressList = el("subjectProgressList");
  const weeklyProgressFill = el("weeklyProgressFill");
  const weeklyProgressLabel = el("weeklyProgressLabel");

  const toastEl = el("toast");

  const SUBJECTS = [
    "Data Structures",
    "Computer Networks",
    "Computer Organization & Assembly Language",
    "Database Systems",
    "Digital Logic Design",
    "Probability & Statistics",
    "Entrepreneurship",
    "General"
  ];

  /* =========================================================
     THEME (DARK MODE)
     ========================================================= */
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    const theme = savedTheme === "dark" ? "dark" : "light";
    applyTheme(theme);
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      themeToggle.querySelector(".theme-icon").textContent = "☀️";
      themeToggle.setAttribute("aria-pressed", "true");
    } else {
      document.documentElement.removeAttribute("data-theme");
      themeToggle.querySelector(".theme-icon").textContent = "🌙";
      themeToggle.setAttribute("aria-pressed", "false");
    }
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    updateTimerRing(); // ring gradient uses CSS vars, refresh after theme swap
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    applyTheme(isDark ? "light" : "dark");
  });

  /* =========================================================
     MOBILE NAV
     ========================================================= */
  navToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active-link"));
      document.querySelectorAll(`[data-nav="${link.dataset.nav}"]`).forEach((l) => l.classList.add("active-link"));
    });
  });

  /* =========================================================
     DASHBOARD: GREETING, DATE, QUOTE
     ========================================================= */
  function renderGreeting() {
    const hour = new Date().getHours();
    let greeting = "Good evening, Student 👋";
    if (hour < 12) greeting = "Good morning, Student 👋";
    else if (hour < 18) greeting = "Good afternoon, Student 👋";
    greetingText.textContent = greeting;
  }

  function renderCurrentDate() {
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    currentDateEl.textContent = now.toLocaleDateString(undefined, options);
  }

  function renderQuote() {
    const dayIndex = Math.floor(Date.now() / 86400000);
    const quote = QUOTES[dayIndex % QUOTES.length];
    quoteTextEl.textContent = quote;
  }

  /* =========================================================
     DATE HELPERS
     ========================================================= */
  function toDateOnly(dateStr) {
    // dateStr: "YYYY-MM-DD" -> local Date at midnight
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getMonday(date) {
    const d = startOfDay(date);
    const day = d.getDay(); // 0 = Sunday
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  }

  /* =========================================================
     TASKS: CRUD
     ========================================================= */
  function addTask(task) {
    tasks.push(task);
    saveTasks();
  }

  function updateTask(id, updates) {
    tasks = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    saveTasks();
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
  }

  function toggleComplete(id) {
    tasks = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasks();
  }

  /* ---------------- TASK FORM ---------------- */
  function resetTaskForm() {
    taskForm.reset();
    taskIdInput.value = "";
    taskFormTitle.textContent = "Add a new task";
    taskSubmitBtn.textContent = "Add Task";
    taskCancelEdit.hidden = true;
    taskTitleError.textContent = "";
    taskDueDateError.textContent = "";
    taskPriorityInput.value = "Medium";
  }

  function fillTaskFormForEdit(task) {
    taskIdInput.value = task.id;
    taskTitleInput.value = task.title;
    taskDetailsInput.value = task.details || "";
    taskSubjectInput.value = task.subject;
    taskPriorityInput.value = task.priority;
    taskDueDateInput.value = task.dueDate;
    taskFormTitle.textContent = "Edit task";
    taskSubmitBtn.textContent = "Save Changes";
    taskCancelEdit.hidden = false;
    taskTitleInput.focus();
  }

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    taskTitleError.textContent = "";
    taskDueDateError.textContent = "";

    const title = taskTitleInput.value.trim();
    const dueDate = taskDueDateInput.value;
    let valid = true;

    if (!title) {
      taskTitleError.textContent = "Please enter a task title.";
      valid = false;
    }
    if (!dueDate) {
      taskDueDateError.textContent = "Please choose a due date.";
      valid = false;
    }
    if (!valid) return;

    const editingId = taskIdInput.value;

    if (editingId) {
      updateTask(editingId, {
        title,
        details: taskDetailsInput.value.trim(),
        subject: taskSubjectInput.value,
        priority: taskPriorityInput.value,
        dueDate
      });
      showToast("Task updated.");
    } else {
      addTask({
        id: generateId(),
        title,
        details: taskDetailsInput.value.trim(),
        subject: taskSubjectInput.value,
        priority: taskPriorityInput.value,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString()
      });
      showToast("Task added.");
    }

    resetTaskForm();
    renderAll();
  });

  taskCancelEdit.addEventListener("click", resetTaskForm);

  /* ---------------- TASK FILTER / SEARCH ---------------- */
  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterChips.forEach((c) => c.classList.remove("active-chip"));
      chip.classList.add("active-chip");
      currentFilter = chip.dataset.filter;
      renderTaskList();
    });
  });

  subjectFilterSelect.addEventListener("change", () => {
    currentSubjectFilter = subjectFilterSelect.value;
    renderTaskList();
  });

  taskSearchInput.addEventListener("input", () => {
    currentSearch = taskSearchInput.value.trim().toLowerCase();
    renderTaskList();
  });

  function getFilteredTasks() {
    return tasks
      .filter((t) => {
        if (currentFilter === "pending") return !t.completed;
        if (currentFilter === "completed") return t.completed;
        if (["High", "Medium", "Low"].includes(currentFilter)) return t.priority === currentFilter;
        return true;
      })
      .filter((t) => currentSubjectFilter === "all" || t.subject === currentSubjectFilter)
      .filter((t) => !currentSearch || t.title.toLowerCase().includes(currentSearch) || (t.details || "").toLowerCase().includes(currentSearch))
      .sort((a, b) => toDateOnly(a.dueDate) - toDateOnly(b.dueDate));
  }

  function formatDueLabel(dueDateStr) {
    const due = toDateOnly(dueDateStr);
    const today = startOfDay(new Date());
    const diffDays = Math.round((due - today) / 86400000);
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays < 0) return `Overdue · ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    return `Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }

  function renderTaskList() {
    const filtered = getFilteredTasks();
    taskListEl.innerHTML = "";

    if (filtered.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-state";
      li.textContent = "No tasks match your filters yet.";
      taskListEl.appendChild(li);
      return;
    }

    filtered.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item priority-${task.priority}${task.completed ? " completed" : ""}`;

      const isOverdue = !task.completed && toDateOnly(task.dueDate) < startOfDay(new Date());
      const dueBadgeClass = isOverdue ? "badge badge-overdue" : "badge badge-due";

      li.innerHTML = `
        <input type="checkbox" class="task-check" ${task.completed ? "checked" : ""} aria-label="Mark '${escapeHtml(task.title)}' as ${task.completed ? "pending" : "completed"}">
        <div class="task-body">
          <p class="task-title">${escapeHtml(task.title)}</p>
          ${task.details ? `<p class="task-details">${escapeHtml(task.details)}</p>` : ""}
          <div class="task-meta">
            <span class="badge badge-subject">${escapeHtml(task.subject)}</span>
            <span class="badge badge-priority-${task.priority}">${priorityDot(task.priority)} ${task.priority}</span>
            <span class="${dueBadgeClass}">${formatDueLabel(task.dueDate)}</span>
          </div>
        </div>
        <div class="task-actions">
          <button type="button" class="edit-btn" aria-label="Edit task">Edit</button>
          <button type="button" class="delete-btn" aria-label="Delete task">Delete</button>
        </div>
      `;

      li.querySelector(".task-check").addEventListener("change", () => {
        toggleComplete(task.id);
        renderAll();
      });
      li.querySelector(".edit-btn").addEventListener("click", () => {
        fillTaskFormForEdit(task);
        document.getElementById("tasks").scrollIntoView({ behavior: "smooth" });
      });
      li.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm(`Delete "${task.title}"?`)) {
          deleteTask(task.id);
          renderAll();
          showToast("Task deleted.");
        }
      });

      taskListEl.appendChild(li);
    });
  }

  function priorityDot(priority) {
    if (priority === "High") return "🔴";
    if (priority === "Medium") return "🟡";
    return "🟢";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* =========================================================
     DASHBOARD STATS
     ========================================================= */
  function renderDashboardStats() {
    const pending = tasks.filter((t) => !t.completed).length;
    const completed = tasks.filter((t) => t.completed).length;
    const today = startOfDay(new Date());
    const weekAhead = new Date(today);
    weekAhead.setDate(weekAhead.getDate() + 7);

    const upcoming = tasks.filter((t) => {
      if (t.completed) return false;
      const due = toDateOnly(t.dueDate);
      return due >= today && due <= weekAhead;
    }).length;

    const total = tasks.length;
    const progressPct = total === 0 ? 0 : Math.round((completed / total) * 100);

    statPending.textContent = String(pending);
    statCompleted.textContent = String(completed);
    statUpcoming.textContent = String(upcoming);
    statProgress.textContent = `${progressPct}%`;

    const todaysTasks = tasks
      .filter((t) => isSameDay(toDateOnly(t.dueDate), today))
      .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

    todayTaskList.innerHTML = "";
    if (todaysTasks.length === 0) {
      todayTaskList.innerHTML = `<li class="empty-state">No tasks due today. Enjoy the breathing room.</li>`;
    } else {
      todaysTasks.forEach((t) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${priorityDot(t.priority)} ${escapeHtml(t.title)}</span><span class="badge badge-subject">${escapeHtml(t.subject)}</span>`;
        if (t.completed) li.style.opacity = "0.55";
        todayTaskList.appendChild(li);
      });
    }
  }

  /* =========================================================
     WEEKLY CALENDAR
     ========================================================= */
  function renderCalendar() {
    const monday = getMonday(new Date());
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    calendarGrid.innerHTML = "";

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      const dayTasks = tasks.filter((t) => isSameDay(toDateOnly(t.dueDate), dayDate));
      const isToday = isSameDay(dayDate, startOfDay(new Date()));

      const dayEl = document.createElement("div");
      dayEl.className = `calendar-day${isToday ? " is-today" : ""}`;
      dayEl.innerHTML = `
        <p class="calendar-day-name">${dayNames[i]}</p>
        <p class="calendar-day-date">${dayDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
      `;

      if (dayTasks.length === 0) {
        const empty = document.createElement("p");
        empty.className = "calendar-empty";
        empty.textContent = "No tasks";
        dayEl.appendChild(empty);
      } else {
        dayTasks.forEach((t) => {
          const taskEl = document.createElement("div");
          taskEl.className = `calendar-task priority-${t.priority}`;
          taskEl.textContent = `${priorityDot(t.priority)} ${t.title}`;
          if (t.completed) taskEl.style.opacity = "0.5";
          dayEl.appendChild(taskEl);
        });
      }

      calendarGrid.appendChild(dayEl);
    }
  }

  /* =========================================================
     POMODORO TIMER
     ========================================================= */
  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function updateTimerRing() {
    const pct = pomodoro.totalSeconds === 0 ? 0 : (1 - pomodoro.remainingSeconds / pomodoro.totalSeconds) * 360;
    timerRing.style.background = `conic-gradient(var(--color-accent) ${pct}deg, var(--color-accent-soft) ${pct}deg)`;
  }

  function renderTimer() {
    const formatted = formatTime(pomodoro.remainingSeconds);
    timerDisplay.textContent = formatted;
    quickTimerDisplay.textContent = formatted;
    pomodoroModeLabel.textContent = pomodoro.mode === "study" ? "Study Session" : "Break Time";
    quickTimerMode.textContent = pomodoro.mode === "study"
      ? (pomodoro.running ? "Focusing…" : "Study session ready")
      : (pomodoro.running ? "On a break…" : "Break ready");
    updateTimerRing();
  }

  function startTimer() {
    if (pomodoro.running) return;
    pomodoro.running = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    pomodoroStatus.textContent = pomodoro.mode === "study" ? "Stay focused — you've got this." : "Enjoy your break.";

    pomodoro.intervalId = setInterval(() => {
      pomodoro.remainingSeconds -= 1;
      if (pomodoro.remainingSeconds <= 0) {
        switchPomodoroMode();
      }
      renderTimer();
    }, 1000);
  }

  function pauseTimer() {
    pomodoro.running = false;
    clearInterval(pomodoro.intervalId);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pomodoroStatus.textContent = "Paused. Resume whenever you're ready.";
  }

  function resetTimer() {
    pauseTimer();
    pomodoro.mode = "study";
    pomodoro.totalSeconds = pomodoroSettings.studyMinutes * 60;
    pomodoro.remainingSeconds = pomodoro.totalSeconds;
    pomodoroStatus.textContent = "Ready when you are.";
    renderTimer();
  }

  function switchPomodoroMode() {
    pauseTimer();
    if (pomodoro.mode === "study") {
      pomodoro.mode = "break";
      pomodoro.totalSeconds = pomodoroSettings.breakMinutes * 60;
    } else {
      pomodoro.mode = "study";
      pomodoro.totalSeconds = pomodoroSettings.studyMinutes * 60;
    }
    pomodoro.remainingSeconds = pomodoro.totalSeconds;
    pomodoroStatus.textContent = pomodoro.mode === "study"
      ? "Break's over — back to studying!"
      : "Nice work! Time for a short break.";
    showToast(pomodoro.mode === "study" ? "Break finished. Back to studying!" : "Study session complete. Take a break!");
    startTimer();
  }

  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);
  quickStartBtn.addEventListener("click", () => {
    document.getElementById("pomodoro").scrollIntoView({ behavior: "smooth" });
    startTimer();
  });

  applySettingsBtn.addEventListener("click", () => {
    const studyMin = Math.max(1, Math.min(120, Number(studyLengthInput.value) || 25));
    const breakMin = Math.max(1, Math.min(60, Number(breakLengthInput.value) || 5));
    pomodoroSettings = { studyMinutes: studyMin, breakMinutes: breakMin };
    savePomodoroSettings();
    resetTimer();
    showToast("Timer settings saved.");
  });

  /* =========================================================
     GRADE TRACKER
     ========================================================= */
  function calcPercentage(obtained, total) {
    if (!total || total <= 0) return 0;
    return Math.round((obtained / total) * 10000) / 100;
  }

  function calcGradeLetter(pct) {
    if (pct >= 85) return "A";
    if (pct >= 70) return "B";
    if (pct >= 55) return "C";
    if (pct >= 40) return "D";
    return "F";
  }

  gradeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    gradeError.textContent = "";

    const subject = gradeSubjectInput.value;
    const obtained = Number(obtainedMarksInput.value);
    const total = Number(totalMarksInput.value);

    if (isNaN(obtained) || isNaN(total) || total <= 0 || obtained < 0) {
      gradeError.textContent = "Enter valid marks (total must be greater than 0).";
      return;
    }
    if (obtained > total) {
      gradeError.textContent = "Obtained marks cannot exceed total marks.";
      return;
    }

    grades.push({
      id: generateId(),
      subject,
      obtained,
      total,
      percentage: calcPercentage(obtained, total)
    });
    saveGrades();
    gradeForm.reset();
    renderGrades();
    renderProgress();
    showToast("Result added.");
  });

  function renderGrades() {
    gradeTableBody.innerHTML = "";

    if (grades.length === 0) {
      gradeTableBody.innerHTML = `<tr class="empty-row"><td colspan="5">No results yet. Add one to see it calculated here.</td></tr>`;
      overallPercentageEl.textContent = "—";
      return;
    }

    grades.forEach((g) => {
      const letter = calcGradeLetter(g.percentage);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(g.subject)}</td>
        <td>${g.obtained} / ${g.total}</td>
        <td>${g.percentage}%</td>
        <td><span class="grade-pill grade-${letter}">${letter}</span></td>
        <td><button type="button" class="grade-remove-btn" aria-label="Remove result">✕</button></td>
      `;
      tr.querySelector(".grade-remove-btn").addEventListener("click", () => {
        grades = grades.filter((x) => x.id !== g.id);
        saveGrades();
        renderGrades();
        renderProgress();
      });
      gradeTableBody.appendChild(tr);
    });

    const avgPct = Math.round((grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length) * 100) / 100;
    const overallLetter = calcGradeLetter(avgPct);
    overallPercentageEl.textContent = `${avgPct}% (${overallLetter})`;
  }

  /* =========================================================
     PROGRESS TRACKER
     ========================================================= */
  function renderProgress() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const overallPct = total === 0 ? 0 : Math.round((completed / total) * 100);

    overallProgressFill.style.width = `${overallPct}%`;
    overallProgressLabel.textContent = `${overallPct}%`;

    subjectProgressList.innerHTML = "";
    SUBJECTS.forEach((subject) => {
      const subjectTasks = tasks.filter((t) => t.subject === subject);
      if (subjectTasks.length === 0) return;
      const subjectCompleted = subjectTasks.filter((t) => t.completed).length;
      const pct = Math.round((subjectCompleted / subjectTasks.length) * 100);

      const wrapper = document.createElement("div");
      wrapper.className = "subject-progress-item";
      wrapper.innerHTML = `
        <div class="progress-header"><span>${escapeHtml(subject)}</span><span>${pct}%</span></div>
        <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
      `;
      subjectProgressList.appendChild(wrapper);
    });

    if (subjectProgressList.children.length === 0) {
      subjectProgressList.innerHTML = `<p class="empty-state">Add tasks with subjects to see subject-wise progress.</p>`;
    }

    // Weekly progress: tasks due this week (Mon-Sun) that are completed
    const monday = getMonday(new Date());
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekTasks = tasks.filter((t) => {
      const due = toDateOnly(t.dueDate);
      return due >= monday && due <= sunday;
    });
    const weekCompleted = weekTasks.filter((t) => t.completed).length;
    const weekPct = weekTasks.length === 0 ? 0 : Math.round((weekCompleted / weekTasks.length) * 100);

    weeklyProgressFill.style.width = `${weekPct}%`;
    weeklyProgressLabel.textContent = `${weekPct}%`;
  }

  /* =========================================================
     TOAST
     ========================================================= */
  let toastTimeout = null;
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* =========================================================
     INIT
     ========================================================= */
  function setDefaultDueDateToToday() {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    taskDueDateInput.value = iso;
  }

  function renderAll() {
    renderDashboardStats();
    renderTaskList();
    renderCalendar();
    renderProgress();
  }

  function init() {
    initTheme();
    renderGreeting();
    renderCurrentDate();
    renderQuote();
    setDefaultDueDateToToday();
    studyLengthInput.value = pomodoroSettings.studyMinutes;
    breakLengthInput.value = pomodoroSettings.breakMinutes;
    renderTimer();
    renderGrades();
    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();