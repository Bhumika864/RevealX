const { noteServiceUrl } = require("../config/noteService");

const getHealth = async () =>
  fetch(`${noteServiceUrl}/health`, {
    signal: AbortSignal.timeout(3_000),
  });

const forwardSharedNoteRequest = async (method, path, body) =>
  fetch(`${noteServiceUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "POST" ? JSON.stringify(body || {}) : undefined,
    signal: AbortSignal.timeout(10_000),
  });

module.exports = { getHealth, forwardSharedNoteRequest };
