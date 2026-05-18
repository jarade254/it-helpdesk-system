const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = new sqlite3.Database("./tickets.db");

// Create table if not exists
db.run(`
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    status TEXT
)
`);

// HOME ROUTE
app.get("/", (req, res) => {
    res.send("🚀 IT Support Dashboard API Running");
});

// GET ALL TICKETS
app.get("/api/tickets", (req, res) => {

    db.all("SELECT * FROM tickets", [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });

});

// CREATE TICKET
app.post("/api/tickets", (req, res) => {

    const title = req.body?.title;

    if (!title) {
        return res.status(400).json({
            error: "title is required"
        });
    }

    db.run(
        "INSERT INTO tickets (title, status) VALUES (?, ?)",
        [title, "open"],

        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                id: this.lastID,
                title,
                status: "open"
            });

        }
    );

});

// CLOSE TICKET
app.put("/api/tickets/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "UPDATE tickets SET status = ? WHERE id = ?",
        ["closed", id],

        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Ticket closed"
            });

        }
    );

});

// DELETE TICKET
app.delete("/api/tickets/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM tickets WHERE id = ?",
        [id],

        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Ticket deleted"
            });

        }
    );

});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
