const { checkNotifications } = require("./services/notificationService");
const intervalMs = Number(process.env.NOTIFICATION_INTERVAL_MS || 60_000);

checkNotifications();
setInterval(checkNotifications, intervalMs);
console.log(`Notification worker polling every ${intervalMs}ms`);
