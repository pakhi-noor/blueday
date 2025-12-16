import { useEffect, useState } from "react";

// -----------------------------
// Mock AI: Insight bar
// -----------------------------
function generateAIInsight(tasks) {
  const pending = tasks.filter((t) => !t.completed);
  const high = pending.filter((t) => t.priority === "high");

  if (pending.length === 0) return "🎉 You're fully caught up. Great work.";
  if (high.length > 0) return `⚠️ You have ${high.length} high-priority task${high.length > 1 ? "s" : ""}.`;
  return "✨ Everything looks manageable. Focus on one task at a time.";
}

// -----------------------------
// Mock AI: Task breakdown
// -----------------------------
// Simulates AI-generated subtasks
function generateSubtasksFromTitle(title) {
  const text = title.toLowerCase();

  if (text.includes("exam") || text.includes("test")) {
    return [
      "Review lecture notes",
      "Practice sample questions",
      "Create a summary sheet",
    ];
  }

  if (text.includes("assignment") || text.includes("project")) {
    return [
      "Read requirements",
      "Plan solution",
      "Implement first draft",
      "Review and submit",
    ];
  }

  if (text.includes("clean") || text.includes("organize")) {
    return [
      "Gather supplies",
      "Start with one area",
      "Dispose of unused items",
    ];
  }

  // Default generic breakdown
  return [
    "Clarify the task",
    "Start with a small step",
    "Complete and review",
  ];
}

//Helper to show nitification
function notify(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

//Helper to format Time
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}


// Convert "YYYY-MM-DD" -> Date using LOCAL time (prevents off-by-one)
function parseYMDToLocalDate(ymd) {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d); // local midnight
}

// Format "YYYY-MM-DD" nicely for UI
function formatDueDateForUI(ymd) {
  const date = parseYMDToLocalDate(ymd);
  return date ? date.toLocaleDateString() : "";
}

// Format Date → YYYY-MM-DD (LOCAL, not UTC)
function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

//Weekday for Mock AI
const WEEKDAY_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// -----------------------------
// Mock AI: Date extraction
// -----------------------------
// Attempts to infer a due date from natural language
function extractDueDateFromTitle(title) {
  const text = title.toLowerCase();
  const today = new Date();
  const todayDay = today.getDay();

  if (/\btoday\b/.test(text)) {
    return formatLocalDate(today);
  }

  if (/\btomorrow\b/.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return formatLocalDate(d);
  }

  if (/\bnext\s+week\b/.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return formatLocalDate(d);
  }

  // --- "next <weekday>" ---
  for (const [dayName, dayIndex] of Object.entries(WEEKDAY_INDEX)) {
    const regexNext = new RegExp(`\\bnext\\s+${dayName}\\b`);
    if (regexNext.test(text)) {
      const d = new Date(today);
      let diff = (dayIndex - todayDay + 7) % 7;
      if (diff === 0) diff = 7;
      diff += 7;
      d.setDate(d.getDate() + diff);
      return formatLocalDate(d);
    }
  }

  // --- "<weekday>" ---
  for (const [dayName, dayIndex] of Object.entries(WEEKDAY_INDEX)) {
    const regex = new RegExp(`\\b(on\\s+)?${dayName}\\b`);
    if (regex.test(text)) {
      const d = new Date(today);
      let diff = (dayIndex - todayDay + 7) % 7;
      if (diff === 0) diff = 7;
      d.setDate(d.getDate() + diff);
      return formatLocalDate(d);
    }
  }

  return "";
}


// -----------------------------
// Calendar helpers
// -----------------------------
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getStartDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0 = Sunday
}


// Reusable component for displaying a single task card
function TaskItem({ task, onToggle, aiBreakdowns, setAiBreakdowns, highlight }) {
  return (
    <div
      onClick={() => onToggle(task.id)}
      className={`
        group cursor-pointer rounded-xl border p-4 mb-3
        transition-all duration-300 ease-out
        hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.01]
        ${highlight ? "ring-2 ring-blue-400 animate-pulse" : ""}
        ${task.completed
          ? "bg-gray-50 dark:bg-zinc-800 opacity-60"
          : "bg-white dark:bg-zinc-900"
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div
          className={`
            mt-1 h-5 w-5 rounded border-2 flex items-center justify-center
            ${task.completed
              ? "bg-blue-500 border-blue-500"
              : "border-gray-400 group-hover:border-blue-500"
            }
          `}
        >
          {task.completed && (
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>

        <div className="flex-1">
          {/* Title + priority row */}
          <div className="flex justify-between items-center">
            <h3 className={task.completed ? "line-through text-gray-400" : ""}>
              {task.title}
            </h3>
            {/* Due date */}
            {task.dueDate && (
              <p className="text-xs text-gray-500 mt-0.5">
                📅 Due: {formatDueDateForUI(task.dueDate)}
              </p>
            )}

            {/* Priority badge*/}
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium
    ${task.priority === "high"
                  ? "bg-red-100 text-red-700"
                  : task.priority === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }
  `}
            >
              {task.priority}
            </span>

          </div>

          {/* AI Breakdown button */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // do not complete task

              // Toggle AI breakdown for this task
              setAiBreakdowns((prev) => {
                if (prev[task.id]) {
                  // If already open → close it
                  const copy = { ...prev };
                  delete copy[task.id];
                  return copy;
                }

                // Generate mock AI breakdown
                return {
                  ...prev,
                  [task.id]: generateSubtasksFromTitle(task.title),
                };
              });
            }}
            className="mt-1 text-xs text-blue-600 hover:underline"
          >
            🤖 {aiBreakdowns[task.id] ? "Hide steps" : "Break into steps"}
          </button>

          {/* AI Breakdown display */}
          {aiBreakdowns[task.id] && (
            <ul className="mt-2 ml-4 list-disc text-sm text-gray-600 dark:text-gray-300">
              {aiBreakdowns[task.id].map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          )}

        </div>

      </div>
    </div>
  );
}


//Priority Order
const priorityOrder = {
  high: 1,
  medium: 2,
  low: 3,
};

//Add sound cue
const ding = new Audio("/ding.mp3");

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3001";



function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  // Toast notification
  const [toast, setToast] = useState("");
  // Trigger animation when a task is added
  const [animateNewTask, setAnimateNewTask] = useState(false);
  // Stores AI breakdowns per task (taskId -> array of steps)
  const [aiBreakdowns, setAiBreakdowns] = useState({});
  //adding the due dates
  const [dueDate, setDueDate] = useState("");
  // Notes panel state
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState(
    localStorage.getItem("personalOpsNotes") || "");
  // Calendar panel state
  const [calendarOpen, setCalendarOpen] = useState(false);
  // Selected calendar date (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(null);
  // Track whether dueDate was set by AI or user
  const [aiSuggestedDate, setAiSuggestedDate] = useState(false);
  // idle | focus | break
  const [mode, setMode] = useState("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);

  //Pomodoro
  useEffect(() => {
    if (mode === "idle") return;

    if (secondsLeft <= 0) {
      if (mode === "focus") {
        ding.play();

        notify(
          "Focus session complete 🎉",
          "Great job! Take a 5-minute break ☕"
        );

        setMode("break");
        setSecondsLeft(5 * 60);
      } else if (mode === "break") {
        ding.play();
        notify(
          "Break over ✨",
          "Ready to jump back into focus?"
        );

        setMode("idle");
        setSecondsLeft(0);
      }
      return;
    }


    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, secondsLeft]);

  //give permission for the notifcation
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);



  // Persist notes locally
  useEffect(() => {
    localStorage.setItem("personalOpsNotes", notes);
  }, [notes]);

  // Load tasks on first render
  useEffect(() => {
    fetchTasks();
  }, []);



  const fetchTasks = async (selectedFilter = filter) => {
    let url = "http://localhost:3001/tasks";

    if (selectedFilter === "pending") {
      url += "?status=pending";
    } else if (selectedFilter === "completed") {
      url += "?status=completed";
    }

    const res = await fetch(url);
    const data = await res.json();
    setTasks(data);
  };


  const createTask = async (e) => {
    e.preventDefault();

    await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority, dueDate }),
    });

    setTitle("");
    setPriority("medium");
    setDueDate("");
    setAiSuggestedDate(false);


    // Trigger animation on next render
    setAnimateNewTask(true);

    await fetchTasks();

    // Stop animation after a short time
    setTimeout(() => setAnimateNewTask(false), 700);

    setToast("✅ Task added");

    setTimeout(() => {
      setToast("");
    }, 2000);



  };
  // toggle if the completed to active and vice versa
  const toggleTask = async (id) => {
    await fetch(`http://localhost:3001/tasks/${id}/toggle`, {
      method: "PATCH",
    });

    fetchTasks();
  };


  // Derived task views for filters
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);


  // adding gradient
  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen 
    bg-gradient-to-br
from-pastel-sky via-white to-pastel-mint


  dark:from-[#0B1220] dark:via-[#0F172A] dark:to-[#020617]
  text-gray-900 dark:text-gray-100">

        <div className="max-w-3xl mx-auto px-6 py-10">
          <div
            className="
    rounded-3xl p-6
    bg-white/5 dark:bg-zinc-900/70
    backdrop-blur-xl
    border border-white/10
    shadow-2xl
  "
          >


            {toast && (
              <div className="fixed top-6 right-6 z-50
        bg-blue-600 text-white px-4 py-2 rounded-lg
        shadow-lg">
                {toast}
              </div>
            )}

            {/* Header */}

            {/* Controls */}
            {/* Task list */}
            {mode !== "idle" && (
              <div
                className={`
      mt-4 text-center text-lg font-semibold
      ${mode === "focus" ? "text-blue-600" : "text-green-600"}
    `}
              >
                {mode === "focus" ? "🔒 Focus time" : "☕ Break time"} —{" "}
                {formatTime(secondsLeft)}
              </div>
            )}
            {/* Header */}
            <div className="grid grid-cols-3 items-center mb-6">
              {/* LEFT */}
              <div className="justify-self-start">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 
                 text-gray-800 dark:text-gray-200"
                >
                  {darkMode ? "☀ Light" : "🌙 Dark"}
                </button>

                <button
                  onClick={() => {
                    if (mode === "idle") {
                      setMode("focus");
                      setSecondsLeft(25 * 60); // 25 min focus
                    } else {
                      setMode("idle");
                      setSecondsLeft(0);
                    }
                  }}
                  className={`
    px-3 py-1 rounded-lg font-medium
    transition-all duration-300
    ${mode === "focus"
                      ? "bg-blue-600 text-white animate-pulse"
                      : mode === "break"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    }
  `}
                >
                  {mode === "idle" && "✨ Focus"}
                  {mode === "focus" && "⏳ Focus"}
                  {mode === "break" && "☕ Break"}
                </button>

              </div>

              {/* CENTER */}
              <div className="text-center">
                <h1
                  className="
        text-4xl font-bold
        text-blue-600
        dark:bg-gradient-to-r
        dark:from-pastel-blue
        dark:via-sky-400
        dark:to-blue-500
        dark:bg-clip-text
        dark:text-transparent
        tracking-tight
      "
                >
                  🦋 BlueDay 🦋
                </h1>

                <p className="mt-2 text-sm text-zinc-400">
                  Stay in flow ✨
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex gap-2 justify-self-end">
                <button
                  onClick={() => setCalendarOpen(true)}
                  className="
        px-4 py-1.5 rounded-xl
        bg-white/10 dark:bg-white/5
        backdrop-blur-md
        border border-white/10
        text-gray-900 dark:text-gray-100
        hover:bg-white/20
        transition
      "
                >
                  📅 Calendar
                </button>

                <button
                  onClick={() => setNotesOpen(true)}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white
                 hover:bg-blue-700 transition"
                >
                  📝 Notes
                </button>
              </div>

            </div>

            <div className="h-px bg-gray-200 dark:bg-zinc-700 mb-6" />




            {/* AI Insight Bar */}
            <div
              className="
    mt-6 mb-6
    flex items-center gap-2
    rounded-xl
    bg-pastel-sky
    border border-blue-200
    px-5 py-4
    text-sm font-medium
    text-pastel-navy
    shadow-sm
    dark:bg-white/5
    dark:border-white/10
    dark:text-gray-300
  "
            >
              <span>💡</span>
              <span>{generateAIInsight(tasks)}</span>
            </div>



            {/* Add Task Form */}
            <form
              onSubmit={createTask}
              className="mb-8 p-5 rounded-2xl 
    bg-gradient-to-br from-white to-gray-50
    dark:from-zinc-800 dark:to-zinc-900
    shadow-md ring-1 ring-gray-200 dark:ring-zinc-700"
            >


              <div className="flex flex-col sm:flex-row gap-3">
                {/* Task title input */}
                <input
                  className="flex-1 rounded-lg border px-4 py-2
                 bg-white dark:bg-zinc-700
                 text-gray-900 dark:text-gray-100
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setTitle(newTitle);

                    // Mock AI: extract due date from text
                    const aiDate = extractDueDateFromTitle(newTitle);

                    if (aiDate) {
                      if (!aiSuggestedDate) {
                        setDueDate(aiDate);
                        setAiSuggestedDate(true);
                      }
                    } else if (aiSuggestedDate) {
                      setDueDate("");
                      setAiSuggestedDate(false);
                    }
                  }}

                  required
                />
                {aiSuggestedDate && (
                  <p className="text-xs text-pastel-navy opacity-70">
                    🤖 AI inferred deadline:{" "}
                    <span className="font-medium">
                      {formatDueDateForUI(dueDate)}
                    </span>
                  </p>
                )}




                {/* Due date picker */}
                <input
                  type="date"
                  className="rounded-lg border px-3 py-2
             bg-white dark:bg-zinc-700
             text-gray-900 dark:text-gray-100
             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    setAiSuggestedDate(false); // user took control
                  }}

                />


                {/* Priority selector */}
                <select
                  className="rounded-lg border px-3 py-2
                 bg-white dark:bg-zinc-700
                 text-gray-900 dark:text-gray-100
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* Add Task Submit button */}
                <button
                  type="submit"
                  className="
    rounded-xl px-6 py-2 font-semibold text-white
    bg-gradient-to-r from-blue-500 to-sky-500
    shadow-lg shadow-blue-500/30
    hover:shadow-xl hover:shadow-blue-500/50
    transition-all duration-300
  "
                >
                  Add Task
                </button>

              </div>
            </form>


            {/* Filter tabs - All/Pending/Completed */}
            <div className="inline-flex bg-gray-100 dark:bg-zinc-800 rounded-full p-1 mb-6">
              {["all", "pending", "completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    fetchTasks(f);
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition
        ${filter === f
                      ? "bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>


            {/* Task list */}
            {filter === "pending" && (
              <>
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-lg font-semibold mb-1">
                      You’re all caught up
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Add a task to start planning your day.
                    </p>
                  </div>

                ) : (
                  <ul className="space-y-2">
                    {pendingTasks
                      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
                      .map((task, index) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={toggleTask}
                          aiBreakdowns={aiBreakdowns}
                          setAiBreakdowns={setAiBreakdowns}
                          highlight={animateNewTask && index === 0}
                        />


                      ))}
                  </ul>
                )}
              </>
            )}

            {filter === "completed" && (
              <>
                {completedTasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No completed tasks yet.
                  </div>
                ) : (
                  <ul className="space-y-2 opacity-75">
                    {completedTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        aiBreakdowns={aiBreakdowns}
                        setAiBreakdowns={setAiBreakdowns}
                      />
                    ))}
                  </ul>
                )}
              </>
            )}

            {filter === "all" && (
              <>
                {/* Active tasks */}
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Active
                </h2>

                <ul className="space-y-2 mb-6">
                  {[...pendingTasks]
                    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
                    .map((task, index) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        aiBreakdowns={aiBreakdowns}
                        setAiBreakdowns={setAiBreakdowns}
                        highlight={animateNewTask && index === 0}
                      />
                    ))}
                </ul>


                {/* Completed tasks */}
                {completedTasks.length > 0 && (
                  <>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                      Completed
                    </h2>

                    <ul className="space-y-2 opacity-75">
                      {completedTasks.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={toggleTask}
                          aiBreakdowns={aiBreakdowns}
                          setAiBreakdowns={setAiBreakdowns}
                        />
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}

          </div>
        </div>
        {/* Notes Slide-over Panel */}
        {notesOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="flex-1 bg-black/40"
              onClick={() => setNotesOpen(false)}
            />

            {/* Panel */}
            <div className="w-full max-w-md bg-white dark:bg-zinc-900
                    p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  📝 Notes
                </h2>

                <button
                  onClick={() => setNotesOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Notes textarea */}
              <textarea
                className="w-full h-[70vh] resize-none rounded-lg border
                   bg-white dark:bg-zinc-800
                   text-gray-900 dark:text-gray-100
                   p-3 focus:outline-none focus:ring-2
                   focus:ring-blue-500"
                placeholder="Write your thoughts, plans, or daily notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}
        {/* Calendar Slide-over Panel */}
        {calendarOpen && (() => {
          const today = new Date();
          const year = today.getFullYear();
          const month = today.getMonth();
          const daysInMonth = getDaysInMonth(year, month);
          const startDay = getStartDayOfMonth(year, month);

          // Map tasks by date (YYYY-MM-DD)
          const tasksByDate = {};
          tasks.forEach(task => {
            if (task.dueDate) {
              tasksByDate[task.dueDate] ||= [];
              tasksByDate[task.dueDate].push(task);
            }
          });

          return (
            <div className="fixed inset-0 z-50 flex">
              {/* Backdrop */}
              <div
                className="flex-1 bg-black/40"
                onClick={() => {
                  setCalendarOpen(false);
                  setSelectedDate(null);
                }}

              />

              {/* Panel */}
              <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-6 shadow-xl overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">📅 Calendar</h2>
                  <button
                    onClick={() => setCalendarOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* Month label */}
                <h3 className="text-center font-medium mb-4">
                  {today.toLocaleString("default", { month: "long" })} {year}
                </h3>

                {/* IMPORTANT: stack calendar + tasks vertically */}
                <div className="flex flex-col gap-5">
                  {/* Calendar grid (by itself) */}
                  <div>
                    <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
                      {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                        <div key={d} className="font-semibold text-gray-500">
                          {d}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-xs">
                      {/* Empty cells before month starts */}
                      {Array.from({ length: startDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}

                      {/* Days */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const dayTasks = tasksByDate[dateKey] || [];

                        return (
                          <div
                            key={day}
                            onClick={() => setSelectedDate(dateKey)}
                            className={`
              border rounded-md p-2 min-h-[64px]
              cursor-pointer transition
              ${selectedDate === dateKey
                                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-zinc-700"
                                : "bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700"
                              }
            `}
                          >
                            <div className="font-semibold">{day}</div>

                            {dayTasks.slice(0, 2).map((t) => (
                              <div
                                key={t.id}
                                className="mt-1 text-[10px] truncate bg-blue-100 text-blue-800 rounded px-1"
                              >
                                {t.title}
                              </div>
                            ))}

                            {dayTasks.length > 2 && (
                              <div className="mt-1 text-[10px] text-gray-500">
                                +{dayTasks.length - 2} more
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tasks for selected date (BOTTOM, always) */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">
                      {selectedDate
                        ? `Tasks for ${formatDueDateForUI(selectedDate)}`
                        : "Click a date to see tasks"}
                    </h3>

                    {!selectedDate ? (
                      <p className="text-sm text-gray-500">Select a day above.</p>
                    ) : (tasksByDate[selectedDate] || []).length === 0 ? (
                      <p className="text-sm text-gray-500">No tasks due on this date.</p>
                    ) : (
                      <ul className="space-y-2">
                        {tasksByDate[selectedDate].map((task) => (
                          <li
                            key={task.id}
                            className="rounded-lg border p-2 bg-white dark:bg-zinc-800"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{task.title}</span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full
                  ${task.priority === "high"
                                    ? "bg-red-100 text-red-700"
                                    : task.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-blue-100 text-blue-700"
                                  }
                `}
                              >
                                {task.priority}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default App;
