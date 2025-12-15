OpsHub
OpsHub is a personal operations dashboard designed to help users manage tasks, deadlines, and daily planning with light AI assistance. It combines a clean task manager, calendar view, notes, and AI-powered insights into a single focused workspace.
This project was built as a portfolio-grade full-stack application with an emphasis on usability, thoughtful AI integration, and clean architecture.
✨ Features
🗂 Task Management
Create, complete, and restore tasks (toggle behavior)
Priority levels (High / Medium / Low)
Due dates with calendar integration
Automatic sorting by priority
🤖 AI-Assisted Productivity (Mock + Real AI)
AI task breakdown into actionable steps
AI date inference from natural language (e.g. “exam tomorrow”)
AI insight bar summarizing workload
Optional OpenAI-powered daily planning endpoint
AI suggestions are non-intrusive and never override user input.
📅 Calendar View
Monthly calendar with task indicators
Click any date to view tasks due that day
Clean slide-over UI
📝 Notes
Persistent notes panel
Stored locally in the browser
Perfect for daily planning or quick thoughts
🌗 UI & UX
Dark mode support
Smooth transitions and subtle animations
Toast notifications
Responsive layout (desktop-first)
🛠 Tech Stack
Frontend
React
Tailwind CSS
Vanilla Fetch API
Local Storage (notes)
Backend
Node.js
Express
SQLite (better-sqlite3)
REST API design
AI
Mock AI logic (date inference, task breakdowns)
Optional OpenAI integration (disabled by default)