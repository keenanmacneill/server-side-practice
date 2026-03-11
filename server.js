const express = require("express");

const usersRoutes = require("./routes/users.routes");
const notesRoutes = require("./routes/notes.routes");

const server = express();

server.use(express.json());

server.get("/", (req, res) => {
  res.status(200).send("API is running");
});

server.use("/users", usersRoutes);
server.use("/notes", notesRoutes);

module.exports = server;
