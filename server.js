const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

// PORT for Railway / local
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname)));

// Database (fixed path for deployment safety)
const db = new sqlite3.Database(path.join(__dirname, "tickets.db"));

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

// Serve frontend homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Error logging (important for Railway debugging)
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});