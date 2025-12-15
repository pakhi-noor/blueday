import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { db } from "./db/database.js";




const app = express();

app.use(cors());
app.use(express.json());


/**
 * AI
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/plan", async (req, res) => {
  const { tasks } = req.body;

  if (!tasks || tasks.length === 0) {
    return res.json({ plan: "No tasks to plan." });
  }

  const taskList = tasks
    .map(t => `- ${t.title} (priority: ${t.priority})`)
    .join("\n");

  const prompt = `
You are a productivity assistant.
Given these tasks, create a clear plan for the day.
Order them logically and explain briefly why.

Tasks:
${taskList}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  res.json({
    plan: completion.choices[0].message.content,
  });
});



//Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Create a task
app.post("/tasks", (req, res) => {
  const { title, dueDate, priority } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const stmt = db.prepare(`
    INSERT INTO tasks (title, dueDate, priority, completed, createdAt)
    VALUES (?, ?, ?, 0, ?)
  `);

  const result = stmt.run(
    title,
    dueDate || null,
    priority || "medium",
    new Date().toISOString()
  );

  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(task);
});


// Get all tasks
app.get("/tasks", (req, res) => {
  const { status, priority } = req.query;

  let query = "SELECT * FROM tasks WHERE 1=1";
  const params = [];

  if (status === "completed") {
    query += " AND completed = 1";
  }

  if (status === "pending") {
    query += " AND completed = 0";
  }

  if (priority) {
    query += " AND priority = ?";
    params.push(priority);
  }

  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});



// Mark task as completed
app.patch("/tasks/:id/toggle", (req, res) => {
  const { id } = req.params;

  db.prepare(`
    UPDATE tasks
    SET completed = CASE
      WHEN completed = 1 THEN 0
      ELSE 1
    END
    WHERE id = ?
  `).run(id);

  res.json({ success: true });
});




const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
