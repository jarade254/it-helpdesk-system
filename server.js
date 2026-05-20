const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const dbPath = path.join(__dirname, "tickets.json");

// Read tickets
function readTickets() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "[]");
  }

  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
}

// Save tickets
function saveTickets(tickets) {
  fs.writeFileSync(dbPath, JSON.stringify(tickets, null, 2));
}

// GET all tickets
app.get("/api/tickets", (req, res) => {
  const tickets = readTickets();
  res.json(tickets);
});

// CREATE ticket
app.post("/api/tickets", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const tickets = readTickets();

  const newTicket = {
    id: Date.now(),
    title,
    status: "open"
  };

  tickets.push(newTicket);
  saveTickets(tickets);

  res.json(newTicket);
});

// CLOSE ticket
app.put("/api/tickets/:id", (req, res) => {
  const id = Number(req.params.id);

  const tickets = readTickets();

  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  ticket.status = "closed";

  saveTickets(tickets);

  res.json({ message: "Ticket closed" });
});

// DELETE ticket
app.delete("/api/tickets/:id", (req, res) => {
  const id = Number(req.params.id);

  let tickets = readTickets();

  tickets = tickets.filter(t => t.id !== id);

  saveTickets(tickets);

  res.json({ message: "Ticket deleted" });
});

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});