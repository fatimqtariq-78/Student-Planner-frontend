# StudyFlow — Student Study Planner

**Plan. Focus. Progress.**

StudyFlow is a modern, fully responsive student productivity dashboard built for the **DecodeLabs Full Stack Development Internship — Project 1**. It brings together task management, a weekly calendar, a Pomodoro focus timer, and a grade calculator into one clean, distraction-free workspace designed for a Computer Science student's daily routine.

## Description

StudyFlow helps a student plan their day, track assignments across subjects, stay focused during study sessions, and monitor academic progress — all in the browser, with no backend required. Every piece of data (tasks, theme preference, grades) is saved locally using `localStorage`, so nothing is lost on refresh.

The interface uses a warm, academic aesthetic — cream backgrounds, charcoal text, and muted lavender/sage/peach accents — instead of the typical blue-and-white template look, paired with a fully designed dark mode.

## Features

- **Dashboard** — personalized greeting, current date, daily motivational quote, live stats (pending / completed / upcoming tasks, overall progress %), today's task list, and a quick-access Pomodoro card.
- **Task Manager** — add, edit, delete, and complete tasks with a title, optional details, subject, priority (High/Medium/Low), and due date. Includes search, filter by status/priority, and filter by subject.
- **Subject Categories** — tasks are tagged to CS courses (Data Structures, Computer Networks, Computer Organization & Assembly Language, Database Systems, Digital Logic Design, Probability & Statistics, Entrepreneurship, General).
- **Weekly Calendar View** — Monday–Sunday layout showing which tasks are due each day, with horizontal scroll-snap on small screens.
- **Pomodoro Timer** — configurable study/break lengths (default 25/5 minutes), start/pause/reset controls, automatic mode switching with a toast notification, and a live progress ring.
- **Grade Tracker & Calculator** — enter obtained/total marks per subject; percentage and letter grade are calculated automatically, along with an overall result across all entries.
- **Progress Tracker** — overall completion percentage, subject-wise progress bars, and a weekly completion bar, all updating automatically as tasks are completed.
- **Dark Mode** — a fully designed dark theme (not just an inverted background), toggled from the header and persisted via `localStorage`.
- **Responsive, Mobile-First Design** — works cleanly from 320px phones up through large desktops, with a collapsible mobile navigation menu.
- **Accessibility basics** — semantic HTML, labeled form fields, visible focus states, adequate color contrast, and ARIA attributes used only where they add real value.

## Technologies Used

- HTML5 (semantic markup)
- CSS3 (custom properties, Flexbox, CSS Grid, media queries, mobile-first)
- Vanilla JavaScript (ES6+, DOM manipulation, events, array methods)
- Local Storage (tasks, theme, grades, timer settings)

No frameworks or libraries are used, per the project brief.

## Project Structure

```
Student-Planner/
│
├── index.html          # All page markup and sections
├── README.md            # This file
│
├── css/
│   └── style.css        # Theme variables, layout, components, dark mode
│
├── js/
│   └── script.js        # App state, rendering, and all interactivity
│
└── assets/
    └── images/           # Reserved for future icons/images (none required currently)
```

## How to Run

1. Download or clone the `Student-Planner` folder.
2. Open the folder in VS Code (or any code editor).
3. Open `index.html` directly in a browser, **or** right-click it in VS Code and choose "Open with Live Server" for auto-reload while editing.
4. Start using the app — add a task, try the Pomodoro timer, log a grade, and toggle dark mode. Everything you enter is saved automatically in your browser.

No build step, package installation, or server is required.

## Responsive Design

StudyFlow is built mobile-first: base styles target small screens, and `min-width` media queries progressively enhance the layout for tablets and desktops (roughly at 640px, 760–860px, and 900px breakpoints). The task manager, grade tracker, and Pomodoro sections stack vertically on mobile and move into side-by-side layouts on larger screens. The weekly calendar becomes a horizontally scrollable, snap-aligned row on narrow viewports and a full 7-column grid from ~760px upward.

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`) and a logical heading hierarchy.
- All form inputs have associated `<label>` elements.
- Buttons use descriptive, meaningful text/labels (including `aria-label` where icon-only).
- Visible keyboard focus outlines on every interactive element.
- Sufficient color contrast in both light and dark themes.
- `aria-live` regions for the task list and Pomodoro status so updates are announced.
- ARIA attributes (`aria-expanded`, `aria-pressed`, `aria-labelledby`) used only where they add real functional value — not sprinkled decoratively.

## JavaScript Functionality

- **Task Manager**: an in-memory array of task objects, synced to `localStorage` on every change; rendered dynamically via DOM creation, with search/filter logic run against the array before rendering.
- **Pomodoro Timer**: a `setInterval`-driven countdown that updates a conic-gradient progress ring each second, switches between study/break modes automatically, and respects user-configured session lengths.
- **Grade Calculator**: computes percentage and letter grade from obtained/total marks with input validation (rejects invalid or out-of-range values), and derives an overall average across all logged results.
- **Progress Tracker**: recalculates overall, subject-wise, and weekly completion percentages from the current task list every time tasks change.
- **Dark Mode**: toggles a `data-theme` attribute on the document root, which drives a full set of CSS custom properties; the choice is saved and restored via `localStorage`.
- **Daily Quote**: selects a quote from a fixed array using the current date, so it changes once per day rather than on every page load.

## Future Improvements

These are intentionally **not** part of the current project, which is a frontend-only Project 1 submission:

- Backend/database integration for syncing data across devices.
- User authentication and multi-user accounts.
- Push/browser notifications for due tasks and Pomodoro completion.
- Recurring tasks and calendar month/year views.

---

Built for the DecodeLabs Full Stack Development Internship — Project 1.