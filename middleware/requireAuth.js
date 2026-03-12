const sessions = require("../store/sessions.store");

function requireAuth(req, res, next) {
  const sessionId = req.cookies.sessionId;
  console.log(req.cookies.sessionId);

  const session = sessions[sessionId];
  console.log(sessions);

  if (!session) {
    return res.status(401).send("Unauthorized");
  }

  req.user = session;
  next();
}

module.exports = requireAuth;
