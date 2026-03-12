const express = require("express");
const cookieParser = require("cookie-parser");

const usersRoutes = require("./routes/users.routes");
const notesRoutes = require("./routes/notes.routes");
const loginRoutes = require("./routes/login.routes");

const server = express();

server.use(express.json());
server.use(cookieParser());

server.get("/", (req, res) => {
  res.status(200).send("API is running");
});
server.use("/login", loginRoutes);
server.use("/users", usersRoutes);
server.use("/notes", notesRoutes);

module.exports = server;
