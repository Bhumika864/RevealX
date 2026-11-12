const noteServiceUrl = process.env.NOTE_SERVICE_URL || "http://localhost:5002";

const getPendingNotifications = async (type) => {
  const response = await fetch(`${noteServiceUrl}/_internal/notifications/${type}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Note service returned ${response.status} for ${type} notifications.`);
  }
  return response.json();
};

const markSent = async (type, id) => {
  const response = await fetch(
    `${noteServiceUrl}/_internal/notifications/${type}/${encodeURIComponent(id)}/sent`,
    {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
    }
  );
  if (!response.ok) {
    throw new Error(`Note service returned ${response.status} when confirming ${type} email.`);
  }
};

module.exports = { getPendingNotifications, markSent };
