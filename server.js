const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

// IMPORTANT: for deployment (Render) + local
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Database
const db = new sqlite3.Database("tickets.db");

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    status TEXT DEFAULT 'open'
  )
`);

// GET all tickets
app.get("/api/tickets", (req, res) => {
  db.all("SELECT * FROM tickets", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// CREATE ticket
app.post("/api/tickets", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  db.run(
    "INSERT INTO tickets (title, status) VALUES (?, 'open')",
    [title],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        id: this.lastID,
        title,
        status: "open"
      });
    }
  );
});

// CLOSE ticket
app.put("/api/tickets/:id", (req, res) => {
  const id = req.params.id;

  db.run(
    "UPDATE tickets SET status = 'closed' WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "Ticket closed" });
    }
  );
});

// DELETE ticket
app.delete("/api/tickets/:id", (req, res) => {
  const id = req.params.id;

  db.run(
    "DELETE FROM tickets WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "Ticket deleted" });
    }
  );
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
