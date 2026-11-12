const isValidDate = (date) => {
  const parsed = new Date(date);
  return !Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now();
};

module.exports = isValidDate;
