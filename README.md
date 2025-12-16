# 🌊 BlueDay
### A Lightweight Personal Productivity Web App
👤 Author: Scharara Islam

🔗 **Live Demo:** https://blueday-app.vercel.app/   

---

## 🧠 Overview

BlueDay is a lightweight, full-stack personal productivity application designed to help users organize tasks, manage priorities, and stay focused throughout the day.

The project emphasizes simplicity, usability, and clean architecture, while demonstrating real-world full-stack development and deployment practices without relying on paid services or external APIs.

---

## ✨ Features

- 📝 Create, edit, and delete tasks  
- 🚦 Priority-based task management (High / Medium / Low)  
- ✅ Mark tasks as completed  
- 🔍 Filter tasks by status and priority  
- 🧠 Smart task insights using **mock AI logic**  
- 💾 Persistent data storage using SQLite  
- 📱 Responsive UI for desktop and mobile  
- 🚀 Live deployment on Vercel  

---

## 🧠 Mock AI Insights

BlueDay includes **mock AI logic** that analyzes task priority and completion status to generate helpful user insights (e.g., highlighting high-priority pending tasks).

This logic is intentionally deterministic and does **not** rely on external AI services, keeping the application lightweight, transparent, and dependency-free.

---

## 🛠️ Tech Stack

### Frontend
- React
- JavaScript (ES6+)
- CSS

### Backend
- Node.js
- Express.js
- RESTful APIs

### Database
- SQLite

### Deployment
- Vercel (Frontend)

---

## 📂 Project Structure
```bash
blueday/
│
├── frontend/          # React frontend
│   └── src/
│       └── App.jsx
│
├── backend/           # Express backend & API routes
│   └── server.js
│
├── database/          # SQLite database
├── .gitignore
└── README.md
```
---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+ recommended)

### Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs on:
http://localhost:3001

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Open in browser:
http://localhost:3000

# 🎯 Project Goals
- Build a real, everyday-use productivity application
- Demonstrate full-stack web development skills
- Practice REST API design and frontend state management
- Deploy a production-ready web app
- Keep the system lightweight and dependency-free



