const getSharedNotePath = (token, confirmReveal = false) => {
  const path = `/_internal/notes/shared/${encodeURIComponent(token)}`;
  return confirmReveal ? `${path}/reveal` : path;
};

module.exports = getSharedNotePath;
